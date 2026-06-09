import logging
from flask import Blueprint, request
from sqlalchemy import func
from datetime import datetime, date, time, timedelta
from core.models import db, User, AnalyticsEvent,UserTestStats
from core.utils.decorators import role_required, rate_limit, APIResponse
from flask_jwt_extended import get_jwt_identity

analytics_bp = Blueprint("analytics", __name__)


MEANINGFUL_EVENTS = [
    "sections_reading",
    "topic_quiz_attempt",
    "quiz_generation_attempt",
]

RETENTION_WINDOWS = {
    "day_1": (1, 1),
    "day_7": (7, 1),
    "day_14": (14, 1),
    "day_30": (30, 1),
}


# ─── Shared helper ────────────────────────────────────────────────────────────


def _resolve_dates(start_param, end_param, default_days=30):
    """Return (start_date, end_date) as datetime objects, or raise ValueError."""
    now = datetime.utcnow()
    if not start_param and not end_param:
        return now - timedelta(days=default_days), now
    if bool(start_param) ^ bool(end_param):
        raise ValueError("Both 'start' and 'end' are required if either is provided")
    start = datetime.fromisoformat(start_param)
    end = datetime.fromisoformat(end_param)
    if start >= end:
        raise ValueError("'start' must be before 'end'")
    if end > now:
        raise ValueError("'end' cannot be in the future")
    return start, end


def _period(start_date, end_date):
    """Return a serialized period dict for response payloads."""

    def to_date(d):
        return d.date() if isinstance(d, datetime) else d

    return {
        "start": to_date(start_date).isoformat(),
        "end": to_date(end_date).isoformat(),
    }


# ─── Retention ────────────────────────────────────────────────────────────────


@analytics_bp.route("/analytics/retention", methods=["GET"])
@role_required("admin")
@rate_limit(capacity=40, refill_rate=2)
def cohort_retention():
    try:
        now = datetime.utcnow()

        # Resolve date range — default to first recorded user → now
        raw_start = request.args.get("start")
        raw_end = request.args.get("end")

        if raw_start or raw_end:
            try:
                start_date, end_date = _resolve_dates(raw_start, raw_end)
            except ValueError as ve:
                return APIResponse.bad_request(str(ve))
        else:
            earliest = db.session.query(func.min(User.created_at)).scalar()
            if not earliest:
                return APIResponse.success(
                    data={"cohorts": []},
                    message="No users recorded yet.",
                    meta=_period(now.date(), now.date()),
                )
            start_date = earliest.date()
            end_date = now.date()

        cohorts = (
            db.session.query(
                func.date(User.created_at).label("reg_date"),
                func.count(User.id).label("user_count"),
            )
            .filter(User.created_at >= start_date, User.created_at <= end_date)
            .group_by(func.date(User.created_at))
            .order_by(func.date(User.created_at))
            .all()
        )

        if not cohorts:
            return APIResponse.success(
                data={"cohorts": []},
                message="No cohorts found for this period.",
                meta=_period(start_date, end_date),
            )

        def calculate_retention(reg_date, user_count, target_day, tolerance):
            """
            reg_date  : datetime.date  (already normalised below)
            user_count: int
            Returns float [0,1], None (window not yet elapsed), or 0.0
            """
            if user_count == 0:
                return 0.0

            reg_dt = datetime.combine(reg_date, time.min)
            window_start = reg_dt + timedelta(days=target_day - tolerance)
            window_end = reg_dt + timedelta(days=target_day + tolerance)

            if now < window_end:
                return None  # window hasn't closed yet

            try:
                retained = (
                    db.session.query(func.count(func.distinct(AnalyticsEvent.user_id)))
                    .join(User, User.id == AnalyticsEvent.user_id)
                    .filter(
                        AnalyticsEvent.user_id.isnot(None),
                        func.date(User.created_at) == reg_date,  # date obj — safe
                        AnalyticsEvent.event_type.in_(MEANINGFUL_EVENTS),
                        AnalyticsEvent.created_at >= window_start,
                        AnalyticsEvent.created_at < window_end,
                    )
                    .scalar()
                    or 0
                )
            except Exception as query_err:
                logging.warning(
                    f"Retention query failed — cohort {reg_date}, "
                    f"day_{target_day}: {query_err}"
                )
                return None

            return round(retained / user_count, 4)

        results = []
        for raw_reg_date, user_count in cohorts:
            # func.date() returns a string ("YYYY-MM-DD") on most DB backends
            if isinstance(raw_reg_date, str):
                reg_date = date.fromisoformat(raw_reg_date)
            else:
                reg_date = raw_reg_date  # already a date object (some backends)

            results.append(
                {
                    "registration_date": reg_date.isoformat(),
                    "new_users": user_count,
                    "retention": {
                        key: calculate_retention(
                            reg_date, user_count, target_day, tolerance
                        )
                        for key, (target_day, tolerance) in RETENTION_WINDOWS.items()
                    },
                }
            )

        return APIResponse.success(
            data={"cohorts": results},
            meta=_period(start_date, end_date),
        )

    except Exception as e:
        logging.error(f"Retention endpoint error: {e}", exc_info=True)
        return APIResponse.server_error("Error computing retention")


# ─── Engagement ───────────────────────────────────────────────────────────────


@analytics_bp.route("/analytics/engagement", methods=["GET"])
@role_required("admin")
@rate_limit(capacity=40, refill_rate=2)
def cumulative_engagement():
    try:
        try:
            start_date, end_date = _resolve_dates(
                request.args.get("start"), request.args.get("end")
            )
        except ValueError as ve:
            return APIResponse.bad_request(str(ve))

        # Fetch ALL active users — not just those registered in the window
        users = (
            db.session.query(User.id, User.created_at)
            .filter(User.is_active == True)
            .all()
        )

        if not users:
            return APIResponse.success(
                data={"engagement": []},
                message="No users found.",
                meta=_period(start_date, end_date),
            )

        results = []
        for user_id, created_at in users:
            # Use the later of (registration date, window start) so we don't
            # count events before the user existed or before the query window
            event_start = max(created_at, start_date)

            distinct_events = (
                db.session.query(func.count(func.distinct(AnalyticsEvent.event_type)))
                .filter(
                    AnalyticsEvent.user_id == user_id,
                    AnalyticsEvent.created_at >= event_start,
                    AnalyticsEvent.created_at <= end_date,
                )
                .scalar()
                or 0
            )
            total_events = (
                db.session.query(func.count(AnalyticsEvent.id))
                .filter(
                    AnalyticsEvent.user_id == user_id,
                    AnalyticsEvent.created_at >= event_start,
                    AnalyticsEvent.created_at <= end_date,
                )
                .scalar()
                or 0
            )

            # Skip users with zero activity in the window
            if total_events == 0:
                continue

            results.append(
                {
                    "user_id": user_id,
                    "registration_date": created_at.date().isoformat(),
                    "distinct_event_types": distinct_events,
                    "total_events": total_events,
                    "depth_score": round(distinct_events / total_events, 2),
                }
            )

        return APIResponse.success(
            data={"engagement": results},
            meta=_period(start_date, end_date),
        )

    except Exception as e:
        db.session.rollback()
        logging.error(f"Error computing engagement: {e}", exc_info=True)
        return APIResponse.server_error("Error computing engagement")


# ─── DAU ──────────────────────────────────────────────────────────────────────


@analytics_bp.route("/analytics/dau", methods=["GET"])
@role_required("admin")
@rate_limit(capacity=40, refill_rate=2)
def daily_active_users():
    try:
        start_p = request.args.get("start")
        end_p = request.args.get("end")

        if not start_p or not end_p:
            end_date = datetime.utcnow().date() - timedelta(days=1)
            start_date = end_date - timedelta(days=7)
        else:
            start_date = datetime.fromisoformat(start_p).date()
            end_date = datetime.fromisoformat(end_p).date()

        dau_data = (
            db.session.query(
                func.date(AnalyticsEvent.created_at).label("day"),
                func.count(func.distinct(AnalyticsEvent.user_id)).label("active_users"),
            )
            .filter(
                func.date(AnalyticsEvent.created_at) >= start_date,
                func.date(AnalyticsEvent.created_at) <= end_date,
            )
            .group_by(func.date(AnalyticsEvent.created_at))
            .order_by(func.date(AnalyticsEvent.created_at))
            .all()
        )

        new_users_map = dict(
            db.session.query(
                func.date(User.created_at).label("day"),
                func.count(User.id).label("new_users"),
            )
            .filter(
                func.date(User.created_at) >= start_date,
                func.date(User.created_at) <= end_date,
            )
            .group_by(func.date(User.created_at))
            .all()
        )

        results = [
            {
                "date": day.isoformat(),
                "active_users": active_users,
                "new_users": new_users_map.get(day, 0),
            }
            for day, active_users in dau_data
        ]

        return APIResponse.success(
            data={"dau": results},
            meta={"start": start_date.isoformat(), "end": end_date.isoformat()},
        )

    except Exception as e:
        db.session.rollback()
        logging.error(f"Error computing DAU: {e}", exc_info=True)
        return APIResponse.server_error("Error computing DAU")


# ─── Device distribution ──────────────────────────────────────────────────────


@analytics_bp.route("/analytics/device-distribution", methods=["GET"])
@role_required("admin")
@rate_limit(capacity=40, refill_rate=2)
def device_distribution():
    try:
        try:
            start_date, end_date = _resolve_dates(
                request.args.get("start"), request.args.get("end")
            )
        except ValueError as ve:
            return APIResponse.bad_request(str(ve))

        device_data = (
            db.session.query(
                AnalyticsEvent.device,
                func.count(AnalyticsEvent.id).label("count"),
            )
            .filter(
                AnalyticsEvent.created_at >= start_date,
                AnalyticsEvent.created_at <= end_date,
            )
            .group_by(AnalyticsEvent.device)
            .all()
        )

        total = sum(count for _, count in device_data)
        results = [
            {
                "device": device or "unknown",
                "count": count,
                "percentage": round((count / total) * 100, 2) if total else 0,
            }
            for device, count in device_data
        ]

        return APIResponse.success(
            data={"distribution": results},
            meta=_period(start_date, end_date),
        )

    except Exception as e:
        db.session.rollback()
        logging.error(f"Error computing device distribution: {e}", exc_info=True)
        return APIResponse.server_error("Error computing device distribution")


# ─── Service usage ────────────────────────────────────────────────────────────


@analytics_bp.route("/analytics/service-usage", methods=["GET"])
@role_required("admin")
@rate_limit(capacity=40, refill_rate=2)
def service_usage():
    try:
        try:
            start_date, end_date = _resolve_dates(
                request.args.get("start"), request.args.get("end")
            )
        except ValueError as ve:
            return APIResponse.bad_request(str(ve))

        service_data = (
            db.session.query(
                AnalyticsEvent.event_type,
                func.count(AnalyticsEvent.id).label("count"),
            )
            .filter(
                AnalyticsEvent.created_at >= start_date,
                AnalyticsEvent.created_at <= end_date,
                ~AnalyticsEvent.event_type.in_(["login_attempt", "register_attempt"]),
            )
            .group_by(AnalyticsEvent.event_type)
            .order_by(func.count(AnalyticsEvent.id).desc())
            .all()
        )

        total = sum(count for _, count in service_data)
        results = [
            {
                "service": event_type or "unknown",
                "count": count,
                "percentage": round((count / total) * 100, 2) if total else 0,
            }
            for event_type, count in service_data
        ]

        return APIResponse.success(
            data={"services": results},
            meta=_period(start_date, end_date),
        )

    except Exception as e:
        db.session.rollback()
        logging.error(f"Error computing service usage: {e}", exc_info=True)
        return APIResponse.server_error("Error computing service usage")


# ─── Conversion rate ──────────────────────────────────────────────────────────


@analytics_bp.route("/analytics/conversion-rate", methods=["GET"])
@role_required("admin")
@rate_limit(capacity=40, refill_rate=2)
def conversion_rate():
    try:
        try:
            start_date, end_date = _resolve_dates(
                request.args.get("start"), request.args.get("end")
            )
        except ValueError as ve:
            return APIResponse.bad_request(str(ve))

        # All users registered up to end_date (they're the top of the funnel)
        total_registered = (
            db.session.query(func.count(User.id))
            .filter(User.created_at <= end_date)
            .scalar()
            or 0
        )

        # Users who performed at least one meaningful action in the window
        service_users = (
            db.session.query(func.count(func.distinct(AnalyticsEvent.user_id)))
            .filter(
                AnalyticsEvent.created_at >= start_date,
                AnalyticsEvent.created_at <= end_date,
                AnalyticsEvent.event_type.in_(
                    [
                        "quiz_generation_attempt",
                        "exam_template_attempt",
                        "sections_reading",
                    ]
                ),
            )
            .scalar()
            or 0
        )

        return APIResponse.success(
            data={
                "conversion": {
                    "total_registered_users": total_registered,
                    "active_service_users": service_users,
                    "conversion_rate": (
                        round((service_users / total_registered) * 100, 2)
                        if total_registered
                        else 0
                    ),
                }
            },
            meta=_period(start_date, end_date),
        )

    except Exception as e:
        db.session.rollback()
        logging.error(f"Error computing conversion rate: {e}", exc_info=True)
        return APIResponse.server_error("Error computing conversion rate")


@analytics_bp.route("/my-test-stats", methods=["GET"])
@role_required("client")
@rate_limit(capacity=5, refill_rate=1)
def get_my_test_stats():
    try:
        user_id = get_jwt_identity()

        stats = UserTestStats.query.filter_by(user_id=user_id).first()

        if not stats:
            # User has no stats yet → return zeros
            return APIResponse.success(
                message="Stats fetched successfully",
                data={
                    "total_tests": 0,
                    "total_correct": 0,
                    "total_wrong": 0,
                    "total_seconds_spent": 0,
                },
            )

        return APIResponse.success(
            message="Stats fetched successfully",
            data={
                "total_tests": stats.total_tests,
                "total_correct": stats.total_correct,
                "total_wrong": stats.total_wrong,
                "total_seconds_spent": stats.total_seconds_spent,
            },
        )

    except Exception as e:
        logging.error(f"Error fetching user stats: {e}")
        return APIResponse.server_error("Server error while fetching stats")


@analytics_bp.route("/global-quiz-stats", methods=["GET"])
@role_required("admin")
@rate_limit(capacity=5, refill_rate=0.5)
def global_quiz_stats():
    try:
        stats = UserTestStats.query.all()

        if not stats:
            return APIResponse.success(
                message="Global stats fetched successfully",
                data={
                    "avg_time_per_question": 0,
                    "avg_accuracy": 0,
                    "total_questions_answered": 0,
                    "total_tests_taken": 0,
                },
            )

        total_seconds = sum(s.total_seconds_spent for s in stats)
        total_correct = sum(s.total_correct for s in stats)
        total_wrong = sum(s.total_wrong for s in stats)
        total_tests = sum(s.total_tests for s in stats)

        total_questions = total_correct + total_wrong

        avg_time_per_question = (
            total_seconds / total_questions if total_questions > 0 else 0
        )

        avg_accuracy = total_correct / total_questions if total_questions > 0 else 0

        return APIResponse.success(
            message="Global stats fetched successfully",
            data={
                "avg_time_per_question": round(avg_time_per_question, 2),
                "avg_accuracy": round(avg_accuracy, 4),
                "total_questions_answered": total_questions,
                "total_tests_taken": total_tests,
            },
        )

    except Exception as e:
        logging.error(f"Error fetching global stats: {e}")
        return APIResponse.server_error("Server error while fetching global stats")

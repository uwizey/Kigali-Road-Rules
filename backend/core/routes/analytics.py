import logging
from flask import Blueprint, request, jsonify
from sqlalchemy import func
from datetime import datetime, timedelta
from core.models import db, User, AnalyticsEvent
from core.utils.decorators import role_required, rate_limit

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


# ─── Shared helper ───────────────────────────────────────────────────────────


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


# ─── Retention ───────────────────────────────────────────────────────────────


@analytics_bp.route("/analytics/retention", methods=["GET"])
@role_required("admin")
@rate_limit(capacity=40, refill_rate=2)
def cohort_retention():
    try:
        try:
            start_date, end_date = _resolve_dates(
                request.args.get("start"), request.args.get("end")
            )
        except ValueError as ve:
            return jsonify({"status": False, "message": str(ve)}), 400

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
            return (
                jsonify(
                    {
                        "status": True,
                        "period": {
                            "start": start_date.date().isoformat(),
                            "end": end_date.date().isoformat(),
                        },
                        "cohorts": [],
                        "message": "No cohorts found for this period.",
                    }
                ),
                200,
            )

        now = datetime.utcnow()

        def calculate_retention(reg_date, user_count, target_day, tolerance):
            if user_count == 0:
                return 0.0
            reg_dt = datetime.combine(reg_date, datetime.min.time())
            window_start = reg_dt + timedelta(days=target_day - tolerance)
            window_end = reg_dt + timedelta(days=target_day + tolerance)
            if now < window_end:
                return None
            try:
                retained = (
                    db.session.query(func.count(func.distinct(AnalyticsEvent.user_id)))
                    .join(User, User.id == AnalyticsEvent.user_id)
                    .filter(
                        AnalyticsEvent.user_id.isnot(None),
                        func.date(User.created_at) == reg_date,
                        AnalyticsEvent.event_type.in_(MEANINGFUL_EVENTS),
                        AnalyticsEvent.created_at >= window_start,
                        AnalyticsEvent.created_at < window_end,
                    )
                    .scalar()
                    or 0
                )
            except Exception as query_err:
                logging.warning(
                    f"Retention query failed — cohort {reg_date}, day_{target_day}: {query_err}"
                )
                return None
            return round(retained / user_count, 4)

        results = [
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
            for reg_date, user_count in cohorts
        ]

        return (
            jsonify(
                {
                    "status": True,
                    "period": {
                        "start": start_date.date().isoformat(),
                        "end": end_date.date().isoformat(),
                    },
                    "cohorts": results,
                }
            ),
            200,
        )

    except Exception as e:
        logging.error(f"Retention endpoint error: {e}", exc_info=True)
        return (
            jsonify(
                {
                    "status": False,
                    "message": "Error computing retention",
                    "error": str(e),
                }
            ),
            500,
        )


# ─── Engagement (per-user events) ────────────────────────────────────────────
# NOTE: Only ONE /analytics/engagement route exists here.
# The session-based variant was a duplicate that silently overwrote this one in Flask.


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
            return jsonify({"status": False, "message": str(ve)}), 400

        users = (
            db.session.query(User.id, func.date(User.created_at))
            .filter(User.created_at >= start_date, User.created_at <= end_date)
            .all()
        )

        results = []
        for user_id, reg_date in users:
            distinct_events = (
                db.session.query(func.count(func.distinct(AnalyticsEvent.event_type)))
                .filter(
                    AnalyticsEvent.user_id == user_id,
                    AnalyticsEvent.created_at >= reg_date,
                    AnalyticsEvent.created_at <= end_date,
                )
                .scalar()
            )
            total_events = (
                db.session.query(func.count(AnalyticsEvent.id))
                .filter(
                    AnalyticsEvent.user_id == user_id,
                    AnalyticsEvent.created_at >= reg_date,
                    AnalyticsEvent.created_at <= end_date,
                )
                .scalar()
            )
            results.append(
                {
                    "user_id": user_id,
                    "registration_date": reg_date.isoformat(),
                    "distinct_event_types": distinct_events,
                    "total_events": total_events,
                    "depth_score": (
                        round(distinct_events / total_events, 2) if total_events else 0
                    ),
                }
            )

        return (
            jsonify(
                {
                    "status": True,
                    "period": {
                        "start": start_date.date().isoformat(),
                        "end": end_date.date().isoformat(),
                    },
                    "engagement": results,
                }
            ),
            200,
        )

    except Exception as e:
        db.session.rollback()
        logging.error(f"Error computing engagement: {e}", exc_info=True)
        return (
            jsonify(
                {"status": False, "message": f"Error computing engagement: {str(e)}"}
            ),
            500,
        )


# ─── DAU ─────────────────────────────────────────────────────────────────────


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

        return (
            jsonify(
                {
                    "status": True,
                    "period": {
                        "start": start_date.isoformat(),
                        "end": end_date.isoformat(),
                    },
                    "dau": results,
                }
            ),
            200,
        )

    except Exception as e:
        db.session.rollback()
        logging.error(f"Error computing DAU: {e}", exc_info=True)
        return (
            jsonify({"status": False, "message": f"Error computing DAU: {str(e)}"}),
            500,
        )


# ─── Device distribution ─────────────────────────────────────────────────────


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
            return jsonify({"status": False, "message": str(ve)}), 400

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

        return (
            jsonify(
                {
                    "status": True,
                    "period": {
                        "start": start_date.isoformat(),
                        "end": end_date.isoformat(),
                    },
                    "distribution": results,
                }
            ),
            200,
        )

    except Exception as e:
        db.session.rollback()
        logging.error(f"Error computing device distribution: {e}", exc_info=True)
        return (
            jsonify(
                {
                    "status": False,
                    "message": f"Error computing device distribution: {str(e)}",
                }
            ),
            500,
        )


# ─── Service usage ───────────────────────────────────────────────────────────


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
            return jsonify({"status": False, "message": str(ve)}), 400

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

        return (
            jsonify(
                {
                    "status": True,
                    "period": {
                        "start": start_date.isoformat(),
                        "end": end_date.isoformat(),
                    },
                    "services": results,
                }
            ),
            200,
        )

    except Exception as e:
        db.session.rollback()
        logging.error(f"Error computing service usage: {e}", exc_info=True)
        return (
            jsonify(
                {"status": False, "message": f"Error computing service usage: {str(e)}"}
            ),
            500,
        )


# ─── Conversion rate ─────────────────────────────────────────────────────────


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
            return jsonify({"status": False, "message": str(ve)}), 400

        login_users = (
            db.session.query(func.count(func.distinct(AnalyticsEvent.user_id)))
            .filter(
                AnalyticsEvent.created_at >= start_date,
                AnalyticsEvent.created_at <= end_date,
                AnalyticsEvent.event_type == "login_attempt",
            )
            .scalar()
        )

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
        )

        conversion_rate_value = (
            round((service_users / login_users) * 100, 2) if login_users else 0
        )

        return (
            jsonify(
                {
                    "status": True,
                    "period": {
                        "start": start_date.isoformat(),
                        "end": end_date.isoformat(),
                    },
                    "conversion": {
                        "login_users": login_users,
                        "service_users": service_users,
                        "conversion_rate": conversion_rate_value,
                    },
                }
            ),
            200,
        )

    except Exception as e:
        db.session.rollback()
        logging.error(f"Error computing conversion rate: {e}", exc_info=True)
        return (
            jsonify(
                {
                    "status": False,
                    "message": f"Error computing conversion rate: {str(e)}",
                }
            ),
            500,
        )

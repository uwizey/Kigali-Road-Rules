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


@analytics_bp.route("/analytics/retention", methods=["GET"])
@role_required("admin")
@rate_limit(capacity=8, refill_rate=1)
def cohort_retention():
    try:
        start_param = request.args.get("start")
        end_param = request.args.get("end")

        # ---- Resolve date range ----
        now = datetime.utcnow()

        if not start_param and not end_param:
            end_date = now
            start_date = now - timedelta(days=30)
            logging.info(
                f"No timeframe provided. Defaulting to last 30 days: {start_date.date()} → {end_date.date()}"
            )

        elif bool(start_param) ^ bool(end_param):
            return (
                jsonify(
                    {
                        "status": False,
                        "message": "Both 'start' and 'end' are required if either is provided",
                    }
                ),
                400,
            )

        else:
            try:
                start_date = datetime.fromisoformat(start_param)
                end_date = datetime.fromisoformat(end_param)
            except ValueError:
                return (
                    jsonify(
                        {
                            "status": False,
                            "message": "Invalid date format. Use ISO 8601: YYYY-MM-DD",
                        }
                    ),
                    400,
                )

            if start_date >= end_date:
                return (
                    jsonify(
                        {"status": False, "message": "'start' must be before 'end'"}
                    ),
                    400,
                )

            if end_date > now:
                return (
                    jsonify(
                        {"status": False, "message": "'end' cannot be in the future"}
                    ),
                    400,
                )

        # ---- Fetch cohorts ----
        cohorts = (
            db.session.query(
                func.date(User.created_at).label("reg_date"),
                func.count(User.id).label("user_count"),
            )
            .filter(
                User.created_at >= start_date,
                User.created_at <= end_date,
            )
            .group_by(func.date(User.created_at))
            .order_by(func.date(User.created_at))
            .all()
        )

        logging.info(f"Found {len(cohorts)} cohorts")

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

        # ---- Retention calculation ----
        def calculate_retention(reg_date, user_count, target_day, tolerance):
            if user_count == 0:
                return 0.0

            reg_dt = datetime.combine(reg_date, datetime.min.time())
            window_start = reg_dt + timedelta(days=target_day - tolerance)
            window_end = reg_dt + timedelta(days=target_day + tolerance)

            # Window hasn't elapsed yet — return null, not 0
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

            rate = round(retained / user_count, 4)
            logging.debug(
                f"Cohort {reg_date} | day_{target_day}: {retained}/{user_count} = {rate}"
            )
            return rate

        # ---- Build results ----
        results = []
        for reg_date, user_count in cohorts:
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
        logging.error(f"Retention endpoint error: {str(e)}", exc_info=True)
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


@analytics_bp.route("/analytics/engagement", methods=["GET"])
@role_required("admin")
@rate_limit(capacity=8, refill_rate=1)
def cumulative_engagement():
    try:
        # Parse query params
        start_date = request.args.get("start")
        end_date = request.args.get("end")

        # Default to last 30 days if no timeframe provided
        if not start_date or not end_date:
            end_date = datetime.utcnow()
            start_date = end_date - timedelta(days=30)
            logging.info(
                f"No timeframe provided. Defaulting to last 30 days: {start_date} → {end_date}"
            )
        else:
            start_date = datetime.fromisoformat(start_date)
            end_date = datetime.fromisoformat(end_date)
            logging.info(f"Using provided timeframe: {start_date} → {end_date}")

        results = []

        # Step 1: Get all users registered in the timeframe
        users = (
            db.session.query(User.id, func.date(User.created_at))
            .filter(User.created_at >= start_date, User.created_at <= end_date)
            .all()
        )
        logging.info(
            f"Found {len(users)} users registered between {start_date} and {end_date}"
        )

        for user_id, reg_date in users:
            logging.debug(
                f"Processing engagement for user {user_id} registered on {reg_date}"
            )

            # Step 2: Count distinct event types performed by this user
            distinct_events = (
                db.session.query(func.count(func.distinct(AnalyticsEvent.event_type)))
                .filter(
                    AnalyticsEvent.user_id == user_id,
                    AnalyticsEvent.created_at >= reg_date,
                    AnalyticsEvent.created_at <= end_date,
                )
                .scalar()
            )

            # Step 3: Count total events performed by this user
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

        logging.info("Cumulative engagement calculation complete")
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
        logging.error(f"Error computing engagement: {str(e)}", exc_info=True)
        return (
            jsonify(
                {"status": False, "message": f"Error computing engagement: {str(e)}"}
            ),
            500,
        )


@analytics_bp.route("/analytics/dau", methods=["GET"])
@role_required("admin")
@rate_limit(capacity=8, refill_rate=1)
def daily_active_users():
    try:
        # Parse query params
        start_date = request.args.get("start")
        end_date = request.args.get("end")

        # Default: last week window (8 days ago → yesterday)
        if not start_date or not end_date:
            end_date = datetime.utcnow().date() - timedelta(days=1)  # yesterday
            start_date = end_date - timedelta(days=7)  # 8 days ago
            logging.info(
                f"No timeframe provided. Defaulting to last week: {start_date} → {end_date}"
            )
        else:
            start_date = datetime.fromisoformat(start_date).date()
            end_date = datetime.fromisoformat(end_date).date()
            logging.info(f"Using provided timeframe: {start_date} → {end_date}")

        results = []

        # Step 1: Query distinct active users per day
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

        # Step 2: Query new users per day
        new_users_data = (
            db.session.query(
                func.date(User.created_at).label("day"),
                func.count(User.id).label("new_users"),
            )
            .filter(func.date(User.created_at) >= start_date, func.date(User.created_at) <= end_date)
            .group_by(func.date(User.created_at))
            .order_by(func.date(User.created_at))
            .all()
        )
        new_users_map = {day: count for day, count in new_users_data}

        # Step 3: Format results
        for day, active_users in dau_data:
            results.append(
                {
                    "date": day.isoformat(),
                    "active_users": active_users,
                    "new_users": new_users_map.get(day, 0),
                }
            )
            logging.debug(
                f"Day {day}: {active_users} active users, {new_users_map.get(day, 0)} new users"
            )

        logging.info("Daily Active Users calculation complete")
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
        logging.error(f"Error computing DAU: {str(e)}", exc_info=True)
        return (
            jsonify({"status": False, "message": f"Error computing DAU: {str(e)}"}),
            500,
        )


@analytics_bp.route("/analytics/device-distribution", methods=["GET"])
@role_required("admin")
@rate_limit(capacity=8, refill_rate=1)
def device_distribution():
    try:
        # Parse query params
        start_date = request.args.get("start")
        end_date = request.args.get("end")

        # Default: last 30 days
        if not start_date or not end_date:
            end_date = datetime.utcnow()
            start_date = end_date - timedelta(days=30)
            logging.info(
                f"No timeframe provided. Defaulting to last 30 days: {start_date} → {end_date}"
            )
        else:
            start_date = datetime.fromisoformat(start_date)
            end_date = datetime.fromisoformat(end_date)
            logging.info(f"Using provided timeframe: {start_date} → {end_date}")

        # Query device distribution
        device_data = (
            db.session.query(
                AnalyticsEvent.device, func.count(AnalyticsEvent.id).label("count")
            )
            .filter(
                AnalyticsEvent.created_at >= start_date,
                AnalyticsEvent.created_at <= end_date,
            )
            .group_by(AnalyticsEvent.device)
            .all()
        )

        results = []
        total = sum(count for _, count in device_data)

        for device, count in device_data:
            results.append(
                {
                    "device": device or "unknown",
                    "count": count,
                    "percentage": round((count / total) * 100, 2) if total else 0,
                }
            )
            logging.debug(
                f"Device {device}: {count} events ({round((count / total) * 100, 2)}%)"
            )

        logging.info("Device distribution calculation complete")
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
        logging.error(f"Error computing device distribution: {str(e)}", exc_info=True)
        return (
            jsonify(
                {
                    "status": False,
                    "message": f"Error computing device distribution: {str(e)}",
                }
            ),
            500,
        )

@analytics_bp.route("/analytics/service-usage", methods=["GET"])
@role_required("admin")
@rate_limit(capacity=8, refill_rate=1)
def service_usage():
    try:
        # Parse query params
        start_date = request.args.get("start")
        end_date = request.args.get("end")

        # Default: last 30 days
        if not start_date or not end_date:
            end_date = datetime.utcnow()
            start_date = end_date - timedelta(days=30)
            logging.info(
                f"No timeframe provided. Defaulting to last 30 days: {start_date} → {end_date}"
            )
        else:
            start_date = datetime.fromisoformat(start_date)
            end_date = datetime.fromisoformat(end_date)
            logging.info(f"Using provided timeframe: {start_date} → {end_date}")

        # Query service usage distribution, excluding login/register
        service_data = (
            db.session.query(
                AnalyticsEvent.event_type, func.count(AnalyticsEvent.id).label("count")
            )
            .filter(
                AnalyticsEvent.created_at >= start_date,
                AnalyticsEvent.created_at <= end_date,
                ~AnalyticsEvent.event_type.in_(
                    ["login_attempt", "register_attempt"]
                ),  # exclude
            )
            .group_by(AnalyticsEvent.event_type)
            .order_by(func.count(AnalyticsEvent.id).desc())
            .all()
        )

        results = []
        total = sum(count for _, count in service_data)

        for event_type, count in service_data:
            results.append(
                {
                    "service": event_type or "unknown",
                    "count": count,
                    "percentage": round((count / total) * 100, 2) if total else 0,
                }
            )
            logging.debug(
                f"Service {event_type}: {count} uses ({round((count / total) * 100, 2)}%)"
            )

        logging.info("Service usage calculation complete")
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
        logging.error(f"Error computing service usage: {str(e)}", exc_info=True)
        return (
            jsonify(
                {"status": False, "message": f"Error computing service usage: {str(e)}"}
            ),
            500,
        )


@analytics_bp.route("/analytics/conversion-rate", methods=["GET"])
@role_required("admin")
@rate_limit(capacity=8, refill_rate=1)
def conversion_rate():
    try:
        # Parse query params
        start_date = request.args.get("start")
        end_date = request.args.get("end")

        # Default: last 30 days
        if not start_date or not end_date:
            end_date = datetime.utcnow()
            start_date = end_date - timedelta(days=30)
            logging.info(
                f"No timeframe provided. Defaulting to last 30 days: {start_date} → {end_date}"
            )
        else:
            start_date = datetime.fromisoformat(start_date)
            end_date = datetime.fromisoformat(end_date)
            logging.info(f"Using provided timeframe: {start_date} → {end_date}")

        # Step 1: Count distinct users who attempted login
        login_users = (
            db.session.query(func.count(func.distinct(AnalyticsEvent.user_id)))
            .filter(
                AnalyticsEvent.created_at >= start_date,
                AnalyticsEvent.created_at <= end_date,
                AnalyticsEvent.event_type == "login_attempt",
            )
            .scalar()
        )

        # Step 2: Count distinct users who used a service after login
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

        # Step 3: Calculate conversion rate
        conversion_rate_value = (
            round((service_users / login_users) * 100, 2) if login_users else 0
        )

        logging.info(
            f"Conversion Rate: {conversion_rate_value}% (login_users={login_users}, service_users={service_users})"
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
        logging.error(f"Error computing conversion rate: {str(e)}", exc_info=True)
        return (
            jsonify(
                {
                    "status": False,
                    "message": f"Error computing conversion rate: {str(e)}",
                }
            ),
            500,
        )


@analytics_bp.route("/analytics/engagement", methods=["GET"])
@role_required("admin")
@rate_limit(capacity=5, refill_rate=1)
def engagement():
    try:
        # Parse timeframe
        start_date = request.args.get("start")
        end_date = request.args.get("end")
        if not start_date or not end_date:
            end_date = datetime.utcnow()
            start_date = end_date - timedelta(days=30)

        # Step 1: Fetch login/logout events
        sessions = build_sessions(start_date, end_date)  # custom helper

        # Step 2: For each session, compute duration + actions
        durations = []
        actions_counts = []
        bounced = 0
        engaged = 0

        for s in sessions:
            duration = (s.end_time - s.start_time).total_seconds()
            actions = count_actions(s.session_id, start_date, end_date)

            durations.append(duration)
            actions_counts.append(actions)

            # Bounce check
            if duration < 60 and actions >= 1:
                bounced += 1

            # Engagement check
            if duration > 60 and actions >= 3:
                engaged += 1

        total_sessions = len(sessions)
        avg_duration = (
            round(sum(durations) / total_sessions, 2) if total_sessions else 0
        )
        avg_actions = (
            round(sum(actions_counts) / total_sessions, 2) if total_sessions else 0
        )
        bounce_rate = round(bounced / total_sessions, 2) if total_sessions else 0
        engaged_rate = round(engaged / total_sessions, 2) if total_sessions else 0

        return (
            jsonify(
                {
                    "status": True,
                    "period": {
                        "start": start_date.isoformat(),
                        "end": end_date.isoformat(),
                    },
                    "engagement": {
                        "avg_session_duration_seconds": avg_duration,
                        "avg_actions_per_session": avg_actions,
                        "bounce_rate": bounce_rate,
                        "engaged_sessions_rate": engaged_rate,
                    },
                }
            ),
            200,
        )

    except Exception as e:
        logging.error(f"Error computing engagement: {str(e)}", exc_info=True)
        return jsonify({"status": False, "message": str(e)}), 500

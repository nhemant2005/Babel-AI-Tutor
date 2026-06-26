from datetime import datetime, timezone, timedelta
from lemma_sdk import Pod

NUDGE_THRESHOLD_DAYS = 2

def run() -> dict:
    pod = Pod.from_env()
    subjects = pod.records.list("subjects",
        filter=[{"field": "status", "op": "eq", "value": "active"}],
        limit=50).to_dict().get("items", [])

    nudges_sent = 0
    now = datetime.now(timezone.utc)

    for subject in subjects:
        sessions = pod.records.list(
            "sessions",
            filter=[{"field": "subject_id", "op": "eq", "value": subject["id"]},
                    {"field": "ended_at", "op": "ne", "value": None}],
            sort=[{"field": "ended_at", "order": "desc"}],
            limit=1,
        ).to_dict().get("items", [])

        if not sessions:
            continue

        last_ended = datetime.fromisoformat(sessions[0]["ended_at"])
        gap = now - last_ended

        if gap > timedelta(days=NUDGE_THRESHOLD_DAYS):
            days_ago = gap.days
            pod.records.create("notifications", {
                "type": "return_nudge",
                "message": f"You haven't studied {subject['name']} in {days_ago} days.",
                "read": False,
            })
            nudges_sent += 1

    return {"nudges_sent": nudges_sent}

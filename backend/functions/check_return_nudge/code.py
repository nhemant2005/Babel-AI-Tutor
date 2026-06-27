#input_type_name: NudgeInput
#output_type_name: NudgeOutput
#function_name: check_return_nudge

from datetime import datetime, timezone, timedelta
from pydantic import BaseModel
from lemma_sdk import FunctionContext, Pod

NUDGE_THRESHOLD_DAYS = 2

class NudgeInput(BaseModel):
    pass

class NudgeOutput(BaseModel):
    nudges_sent: int

async def check_return_nudge(ctx: FunctionContext, data: NudgeInput) -> NudgeOutput:
    pod = Pod.from_env()
    subjects = pod.records.list("subjects",
        filter=[{"field": "status", "op": "eq", "value": "active"}],
        limit=50).to_dict()["items"]

    nudges_sent = 0
    now = datetime.now(timezone.utc)

    for subject in subjects:
        sessions = pod.records.list(
            "sessions",
            filter=[{"field": "subject_id", "op": "eq", "value": subject["id"]},
                    {"field": "ended_at", "op": "ne", "value": None}],
            sort=[{"field": "ended_at", "direction": "desc"}],
            limit=1,
        ).to_dict()["items"]
        if not sessions:
            continue
        last_ended = datetime.fromisoformat(sessions[0]["ended_at"])
        gap = now - last_ended
        if gap > timedelta(days=NUDGE_THRESHOLD_DAYS):
            pod.records.create("notifications", {
                "type": "return_nudge",
                "message": f"You haven't studied {subject['name']} in {gap.days} days.",
                "read": False,
            })
            nudges_sent += 1

    return NudgeOutput(nudges_sent=nudges_sent)

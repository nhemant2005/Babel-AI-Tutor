#input_type_name: GeneratePlanInput
#output_type_name: GeneratePlanOutput
#function_name: generate_plan

from datetime import date, timedelta
from typing import List, Any
from pydantic import BaseModel
from lemma_sdk import FunctionContext, Pod

DAY_MAP = {"monday": 0, "tuesday": 1, "wednesday": 2, "thursday": 3,
           "friday": 4, "saturday": 5, "sunday": 6}

class GeneratePlanInput(BaseModel):
    subject_id: str

class GeneratePlanOutput(BaseModel):
    scheduled: int
    plan: List[Any]

async def generate_plan(ctx: FunctionContext, data: GeneratePlanInput) -> GeneratePlanOutput:
    pod = Pod.from_env()
    subject = pod.records.get("subjects", data.subject_id)
    deadline = date.fromisoformat(subject["deadline"]) if subject.get("deadline") else None
    available_days = subject.get("available_days") or list(DAY_MAP.keys())
    duration = subject.get("duration_per_day_mins") or 60
    available_day_nums = {DAY_MAP[d.lower()] for d in available_days if d.lower() in DAY_MAP}

    topics = pod.records.list(
        "topics",
        filter=[{"field": "subject_id", "op": "eq", "value": data.subject_id}],
        sort=[{"field": "depth_rank", "direction": "asc"}],
        limit=100,
    ).to_dict()["items"]

    existing = pod.records.list(
        "plan",
        filter=[{"field": "subject_id", "op": "eq", "value": data.subject_id}],
        limit=200,
    ).to_dict()["items"]
    for row in existing:
        pod.records.delete("plan", row["id"])

    today = date.today()
    current = today
    plan_rows = []

    for topic in topics:
        while current.weekday() not in available_day_nums:
            current += timedelta(days=1)
        if deadline and current > deadline:
            break
        pod.records.create("plan", {
            "subject_id": data.subject_id,
            "topic_id": topic["id"],
            "scheduled_date": current.isoformat(),
            "duration_mins": min(duration, topic.get("estimated_mins") or duration),
            "status": "scheduled",
        })
        plan_rows.append({"topic": topic["name"], "date": current.isoformat()})
        current += timedelta(days=1)

    return GeneratePlanOutput(scheduled=len(plan_rows), plan=plan_rows)

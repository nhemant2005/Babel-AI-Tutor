#input_type_name: SessionContextInput
#output_type_name: SessionContextOutput
#function_name: build_session_context

from pydantic import BaseModel
from lemma_sdk import FunctionContext, Pod

class SessionContextInput(BaseModel):
    topic_id: str
    subject_id: str
    session_type: str
    persona: str = "socratic"

class SessionContextOutput(BaseModel):
    context: str
    deep_processing_path: str

async def build_session_context(ctx: FunctionContext, data: SessionContextInput) -> SessionContextOutput:
    pod = Pod.from_env()

    soul = pod.files.download(f"/tutor/soul_{data.persona}.md").decode("utf-8")

    try:
        profile = pod.files.download("/student/profile.md").decode("utf-8")
    except Exception:
        profile = "No profile yet — this is the student's first session."

    try:
        topic = pod.records.get("topics", data.topic_id)
    except Exception:
        topic = {"name": "Trial Session", "structural_summary": "This is an introductory trial session to get to know the material."}

    try:
        subject = pod.records.get("subjects", data.subject_id)
    except Exception:
        subject = {"name": "Unknown Subject", "intake_context": ""}

    try:
        lm_items = pod.records.list(
            "learner_model",
            filter=[{"field": "topic_id", "op": "eq", "value": data.topic_id}],
            limit=1,
        ).to_dict()["items"]
        lm = lm_items[0] if lm_items else {}
    except Exception:
        lm = {}

    deep_path = f"/subjects/{data.subject_id}/deep-processing/{data.topic_id}.md"
    try:
        deep_content = pod.files.download(deep_path).decode("utf-8")
    except Exception:
        deep_content = topic.get("structural_summary", "")

    context = f"""## Tutor Persona
{soul}

## Student Profile
{profile}

## Current Topic: {topic.get("name", "")}
{deep_content}

## Learner Model State
- Confidence: {lm.get("confidence", "unknown")} (internal only — never reveal to student)
- Last seen: {lm.get("last_seen", "never")}
- Completion: {lm.get("completion_status", "not_started")}

## Subject Context
- Subject: {subject.get("name", "")}
- Intake context: {subject.get("intake_context", "")}

## Session Type: {data.session_type}
"""
    return SessionContextOutput(context=context, deep_processing_path=deep_path)

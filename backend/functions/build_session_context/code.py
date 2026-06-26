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

    soul = pod.files.read(f"/tutor/soul_{data.persona}.md")

    try:
        profile = pod.files.read("/student/profile.md")
    except Exception:
        profile = "No profile yet — this is the student's first session."

    topic = pod.records.get("topics", data.topic_id)
    subject = pod.records.get("subjects", data.subject_id)

    lm_results = pod.records.list(
        "learner_model",
        filter=[{"field": "topic_id", "op": "eq", "value": data.topic_id}],
        limit=1,
    )
    lm_items = lm_results.to_dict().get("items", [])
    lm = lm_items[0] if lm_items else {}

    deep_path = f"/subjects/{data.subject_id}/deep-processing/{data.topic_id}.md"
    try:
        deep_content = pod.files.read(deep_path)
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
from lemma_sdk import Pod

def run(topic_id: str, subject_id: str, session_type: str,
        persona: str = "socratic") -> dict:
    pod = Pod.from_env()

    soul_path = f"/tutor/soul_{persona}.md"
    soul = pod.files.read(soul_path)

    try:
        profile = pod.files.read("/student/profile.md")
    except Exception:
        profile = "No profile yet — this is the student's first session."

    topic = pod.records.get("topics", topic_id)
    subject = pod.records.get("subjects", subject_id)

    lm_results = pod.records.list(
        "learner_model",
        filter=[{"field": "topic_id", "op": "eq", "value": topic_id}],
        limit=1,
    )
    lm_items = lm_results.to_dict().get("items", [])
    lm = lm_items[0] if lm_items else {}

    deep_path = f"/subjects/{subject_id}/deep-processing/{topic_id}.md"
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

## Session Type: {session_type}
"""
    return {"context": context, "deep_processing_path": deep_path}

from lemma_sdk import Pod

def run(cache_key: str, cache_type: str, output_path: str,
        subject_id: str, topic_id: str | None = None) -> dict:
    pod = Pod.from_env()
    record = {
        "cache_key": cache_key,
        "cache_type": cache_type,
        "output_path": output_path,
        "subject_id": subject_id,
    }
    if topic_id:
        record["topic_id"] = topic_id
    pod.records.create("content_cache", record)
    return {"ok": True}

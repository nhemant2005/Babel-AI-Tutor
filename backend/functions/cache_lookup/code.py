from lemma_sdk import Pod

def run(cache_key: str, cache_type: str) -> dict:
    pod = Pod.from_env()
    results = pod.records.list(
        "content_cache",
        filter=[{"field": "cache_key", "op": "eq", "value": cache_key},
                {"field": "cache_type", "op": "eq", "value": cache_type}],
        limit=1,
    )
    items = results.to_dict().get("items", [])
    if items:
        return {"hit": True, "output_path": items[0]["output_path"]}
    return {"hit": False, "output_path": None}

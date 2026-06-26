#input_type_name: CacheLookupInput
#output_type_name: CacheLookupOutput
#function_name: cache_lookup

from typing import Optional
from pydantic import BaseModel
from lemma_sdk import FunctionContext, Pod

class CacheLookupInput(BaseModel):
    cache_key: str
    cache_type: str

class CacheLookupOutput(BaseModel):
    hit: bool
    output_path: Optional[str]

async def cache_lookup(ctx: FunctionContext, data: CacheLookupInput) -> CacheLookupOutput:
    pod = Pod.from_env()
    results = pod.records.list(
        "content_cache",
        filter=[{"field": "cache_key", "op": "eq", "value": data.cache_key},
                {"field": "cache_type", "op": "eq", "value": data.cache_type}],
        limit=1,
    )
    items = results.to_dict().get("items", [])
    if items:
        return CacheLookupOutput(hit=True, output_path=items[0]["output_path"])
    return CacheLookupOutput(hit=False, output_path=None)
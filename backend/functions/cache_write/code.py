#input_type_name: CacheWriteInput
#output_type_name: CacheWriteOutput
#function_name: cache_write

from typing import Optional
from pydantic import BaseModel
from lemma_sdk import FunctionContext, Pod

class CacheWriteInput(BaseModel):
    cache_key: str
    cache_type: str
    output_path: str
    subject_id: str
    topic_id: Optional[str] = None

class CacheWriteOutput(BaseModel):
    ok: bool

async def cache_write(ctx: FunctionContext, data: CacheWriteInput) -> CacheWriteOutput:
    pod = Pod.from_env()
    record = {
        "cache_key": data.cache_key,
        "cache_type": data.cache_type,
        "output_path": data.output_path,
        "subject_id": data.subject_id,
    }
    if data.topic_id:
        record["topic_id"] = data.topic_id
    pod.records.create("content_cache", record)
    return CacheWriteOutput(ok=True)
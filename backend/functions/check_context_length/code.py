#input_type_name: ContextLengthInput
#output_type_name: ContextLengthOutput
#function_name: check_context_length

from typing import List, Any
from pydantic import BaseModel
from lemma_sdk import FunctionContext

COMPRESSION_THRESHOLD = 40000

class ContextLengthInput(BaseModel):
    message_history: List[Any]

class ContextLengthOutput(BaseModel):
    needs_compression: bool
    estimated_tokens: int

async def check_context_length(ctx: FunctionContext, data: ContextLengthInput) -> ContextLengthOutput:
    total_chars = sum(len(str(m.get("content", ""))) for m in data.message_history)
    estimated_tokens = total_chars // 4
    return ContextLengthOutput(
        needs_compression=estimated_tokens > COMPRESSION_THRESHOLD,
        estimated_tokens=estimated_tokens
    )
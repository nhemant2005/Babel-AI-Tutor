#input_type_name: HashInput
#output_type_name: HashOutput
#function_name: hash_content

import hashlib
from pydantic import BaseModel
from lemma_sdk import FunctionContext

class HashInput(BaseModel):
    content: str

class HashOutput(BaseModel):
    hash: str

async def hash_content(ctx: FunctionContext, data: HashInput) -> HashOutput:
    return HashOutput(hash=hashlib.sha256(data.content.encode()).hexdigest())
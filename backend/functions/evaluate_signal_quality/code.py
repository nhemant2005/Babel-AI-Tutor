#input_type_name: SignalInput
#output_type_name: SignalOutput
#function_name: evaluate_signal_quality

from pydantic import BaseModel
from lemma_sdk import FunctionContext

class SignalInput(BaseModel):
    message: str

class SignalOutput(BaseModel):
    quality: str
    word_count: int

async def evaluate_signal_quality(ctx: FunctionContext, data: SignalInput) -> SignalOutput:
    word_count = len(data.message.split())
    thin_phrases = [
        "i don't know", "idk", "not sure", "maybe", "yes", "no",
        "ok", "okay", "sure", "i think so", "probably"
    ]
    text = data.message.lower().strip()
    is_too_short = word_count < 8
    is_thin_phrase = any(text == p or text.startswith(p + " ") for p in thin_phrases)
    quality = "thin" if (is_too_short or is_thin_phrase) else "sufficient"
    return SignalOutput(quality=quality, word_count=word_count)
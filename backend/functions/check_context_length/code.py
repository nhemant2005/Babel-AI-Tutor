COMPRESSION_THRESHOLD = 40000

def run(message_history: list[dict]) -> dict:
    total_chars = sum(len(m.get("content", "")) for m in message_history)
    estimated_tokens = total_chars // 4
    needs_compression = estimated_tokens > COMPRESSION_THRESHOLD
    return {
        "needs_compression": needs_compression,
        "estimated_tokens": estimated_tokens
    }

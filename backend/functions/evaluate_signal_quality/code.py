def run(message: str) -> dict:
    word_count = len(message.split())
    thin_phrases = [
        "i don't know", "idk", "not sure", "maybe", "yes", "no",
        "ok", "okay", "sure", "i think so", "probably"
    ]
    text = message.lower().strip()
    is_too_short = word_count < 8
    is_thin_phrase = any(text == p or text.startswith(p + " ") for p in thin_phrases)
    quality = "thin" if (is_too_short or is_thin_phrase) else "sufficient"
    return {"quality": quality, "word_count": word_count}

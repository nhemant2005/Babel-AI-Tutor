import hashlib

def run(content: str) -> dict:
    return {"hash": hashlib.sha256(content.encode()).hexdigest()}

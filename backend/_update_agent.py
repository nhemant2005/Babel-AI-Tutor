"""One-shot script to update a single agent's instruction in the pod."""
import json, subprocess, sys
from pathlib import Path

LEMMA = r"C:\Users\nhema\.local\bin\lemma.exe"
POD   = "019f0438-7cc1-73e4-839a-d178cab4d79a"
BASE  = Path(r"D:\Gappy_Ai\backend\agents")

agent_name = sys.argv[1] if len(sys.argv) > 1 else "ingest-agent"
agent_dir  = next((d for d in BASE.iterdir() if d.is_dir() and d.name.replace("_", "-") in agent_name or agent_name.replace("-", "_") in d.name), None)

if not agent_dir:
    # try exact match by directory name
    for d in BASE.iterdir():
        if d.is_dir():
            agent_dir = d
            break

# Find the right dir
for d in BASE.iterdir():
    if not d.is_dir(): continue
    canon = d.name.replace("_", "-")
    if canon == agent_name or d.name == agent_name:
        agent_dir = d
        break

print(f"Updating agent from: {agent_dir}")
payload = json.loads((agent_dir / "agent.json").read_text(encoding="utf-8-sig"))
instruction_file = agent_dir / "instruction.md"
if instruction_file.exists():
    payload["instruction"] = instruction_file.read_text(encoding="utf-8")

# Strip unsupported fields
for key in ("permissions",):
    payload.pop(key, None)

tmp = Path(r"D:\Gappy_Ai\backend") / "_tmp_agent_update.json"
tmp.write_text(json.dumps(payload, ensure_ascii=False), encoding="utf-8")

r = subprocess.run(
    [LEMMA, "agent", "update", agent_name, "--file", str(tmp), "--pod", POD],
    capture_output=True, text=True, timeout=60
)
print((r.stdout + r.stderr).strip())
tmp.unlink(missing_ok=True)

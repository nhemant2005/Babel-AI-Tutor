"""Update all agents in the pod."""
import json, subprocess
from pathlib import Path

LEMMA = r"C:\Users\nhema\.local\bin\lemma.exe"
POD   = "019f0438-7cc1-73e4-839a-d178cab4d79a"
BASE  = Path(r"D:\Gappy_Ai\backend\agents")

for d in sorted(BASE.iterdir()):
    if not d.is_dir(): continue
    aj = d / "agent.json"
    if not aj.exists(): continue

    payload = json.loads(aj.read_text(encoding="utf-8-sig"))
    name = payload["name"]

    instr = d / "instruction.md"
    if instr.exists():
        payload["instruction"] = instr.read_text(encoding="utf-8")

    payload.pop("permissions", None)  # permissions set separately

    tmp = BASE.parent / "_tmp_agent.json"
    tmp.write_text(json.dumps(payload, ensure_ascii=False), encoding="utf-8")

    r = subprocess.run(
        [LEMMA, "agent", "update", name, "--file", str(tmp), "--pod", POD],
        capture_output=True, text=True, timeout=60
    )
    out = (r.stdout + r.stderr).strip()
    status = "OK" if r.returncode == 0 else "FAIL"
    print(f"  {status}   {name}: {out[:80] if status == 'FAIL' else ''}")
    tmp.unlink(missing_ok=True)

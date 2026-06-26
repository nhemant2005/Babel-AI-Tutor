import json, subprocess, sys
from pathlib import Path

BASE = Path(r"D:\Gappy_Ai\backend\functions")
POD = "019f0438-7cc1-73e4-839a-d178cab4d79a"
LEMMA = r"C:\Users\nhema\.local\bin\lemma.exe"

for d in sorted(BASE.iterdir()):
    if not d.is_dir():
        continue
    fj = d / "function.json"
    fc = d / "code.py"
    if not fj.exists() or not fc.exists():
        continue
    data = json.loads(fj.read_text(encoding="utf-8-sig"))
    data["code"] = fc.read_text(encoding="utf-8")
    name = data["name"]
    tmp = BASE.parent / f"_tmp_{name}.json"
    tmp.write_text(json.dumps(data, ensure_ascii=False), encoding="utf-8")
    r = subprocess.run([LEMMA, "function", "update", name, "--file", str(tmp), "--pod", POD],
                       capture_output=True, text=True, timeout=60)
    out = (r.stdout + r.stderr).strip()
    if "ERROR" in out or "FAILED" in out or r.returncode != 0:
        print(f"  FAIL {name}: {out[:200]}")
    else:
        print(f"  OK   {name}")
    tmp.unlink(missing_ok=True)

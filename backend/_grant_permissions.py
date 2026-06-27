"""
Grant table/file permissions to functions and agents via CLI.
Reads each resource JSON, finds the 'permissions.grants' array, and calls
`lemma function|agent permissions replace` for each one.
"""
import json, subprocess, sys
from pathlib import Path

LEMMA = r"C:\Users\nhema\.local\bin\lemma.exe"
POD   = "019f0438-7cc1-73e4-839a-d178cab4d79a"
BASE  = Path(r"D:\Gappy_Ai\backend")

SKIP_TYPES = {"file_path", "folder"}  # must be set via lemma.work UI

def grant(resource_type: str, name: str, grants: list, cmd: list[str]):
    """grants is list of {resource_type, resource_name, permission_ids} dicts."""
    supported = [g for g in grants if g.get("resource_type") not in SKIP_TYPES]
    if not supported:
        print(f"  {name}: no supported grants to apply")
        return

    payload = json.dumps({"grants": supported})
    tmp = BASE / "_tmp_perms.json"
    tmp.write_text(payload, encoding="utf-8")

    r = subprocess.run(
        [LEMMA, *cmd, "permissions", "replace", name, "--file", str(tmp), "--pod", POD],
        capture_output=True, text=True, timeout=60
    )
    out = (r.stdout + r.stderr).strip()
    if r.returncode != 0 and "already" not in out.lower():
        print(f"  FAIL {name}: {out[:200]}")
    else:
        print(f"  OK   {name} ({len(supported)} grants)")
    tmp.unlink(missing_ok=True)

print("=== Granting function permissions ===")
for d in sorted((BASE / "functions").iterdir()):
    if not d.is_dir(): continue
    fj = d / "function.json"
    if not fj.exists(): continue
    data = json.loads(fj.read_text(encoding="utf-8-sig"))
    grants = data.get("permissions", {}).get("grants", [])
    if not grants: continue
    name = data["name"]
    grant(resource_type="function", name=name, grants=grants, cmd=["function"])

print("\n=== Granting agent permissions ===")
for d in sorted((BASE / "agents").iterdir()):
    if not d.is_dir(): continue
    aj = d / "agent.json"
    if not aj.exists(): continue
    data = json.loads(aj.read_text(encoding="utf-8-sig"))
    grants = data.get("permissions", {}).get("grants", [])
    if not grants: continue
    name = data["name"]
    grant(resource_type="agent", name=name, grants=grants, cmd=["agent"])

print("\nDone.")

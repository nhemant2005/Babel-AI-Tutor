"""
One-time setup: creates all Lemma tables, deploys functions/agents/workflows,
uploads persona files. Run from the repo root after: lemma auth login

Usage:
  python backend/setup.py
"""

import json
import subprocess
import sys
from pathlib import Path

BASE = Path(__file__).parent
POD = "019f0438-7cc1-73e4-839a-d178cab4d79a"


def read(path: Path) -> str:
    # utf-8-sig strips BOM if present
    return path.read_text(encoding="utf-8-sig")


SKIP_ERRORS = ("already exists", "CONFLICT", "DUPLICATE")

def fix_file_grants(payload: dict) -> None:
    grants = payload.get("permissions", {}).get("grants", [])
    # Folder grants are not supported via the permissions API — strip them.
    # (Set file access manually in the Lemma web UI if needed.)
    payload.get("permissions", {})["grants"] = [
        g for g in grants if g.get("resource_type") not in ("file_path", "folder")
    ]

def run(cmd: list[str], check: bool = True) -> subprocess.CompletedProcess:
    print(f"  > {' '.join(str(c) for c in cmd)}")
    result = subprocess.run(cmd, capture_output=True, text=True)
    combined = result.stdout + result.stderr
    if result.returncode != 0:
        if any(s in combined for s in SKIP_ERRORS):
            print(f"    skipped (already exists)")
        else:
            print(f"    ERROR: {combined.strip()}")
            if check:
                sys.exit(1)
    else:
        if result.stdout:
            print(f"    {result.stdout.strip()}")
    return result


def main():
    print("\n=== Gappy.AI Pod Setup ===\n")

    # Tables — positional arg is the name; payload is the schema only
    print("1. Creating tables...")
    for table in ["subjects", "topics", "learner_model", "sessions",
                  "plan", "content_cache", "notifications"]:
        path = BASE / "tables" / f"{table}.json"
        payload = json.loads(read(path))
        payload.pop("name", None)  # name goes as positional arg
        run(["lemma", "table", "create", table,
             "--data", json.dumps(payload), "--pod", POD])

    print("\n2. Deploying functions...")
    for fn_dir in sorted((BASE / "functions").iterdir()):
        fn_json = fn_dir / "function.json"
        fn_code = fn_dir / "code.py"
        if fn_json.exists() and fn_code.exists():
            payload = json.loads(read(fn_json))
            payload["code"] = read(fn_code)
            fix_file_grants(payload)
            run(["lemma", "function", "create",
                 "--data", json.dumps(payload), "--pod", POD])

    print("\n3. Creating file folders...")
    for folder in ["tutor", "subjects", "student"]:
        run(["lemma", "file", "mkdir", f"/{folder}/", "--pod", POD])

    print("\n4. Deploying agents...")
    for agent_dir in sorted((BASE / "agents").iterdir()):
        a_json = agent_dir / "agent.json"
        a_instruction = agent_dir / "instruction.md"
        if a_json.exists():
            payload = json.loads(read(a_json))
            if a_instruction.exists():
                payload["instruction"] = read(a_instruction)
            fix_file_grants(payload)
            run(["lemma", "agent", "create",
                 "--data", json.dumps(payload), "--pod", POD])

    print("\n5. Deploying workflows...")
    for wf in sorted((BASE / "workflows").glob("*.json")):
        run(["lemma", "workflow", "validate",
             "--data", read(wf), "--pod", POD], check=False)
        run(["lemma", "workflow", "create",
             "--data", read(wf), "--pod", POD])

    print("\n6. Uploading persona files...")
    for persona in (BASE / "personas").glob("*.md"):
        run(["lemma", "file", "write", f"/tutor/{persona.name}",
             "--from", str(persona), "--pod", POD])

    print("\n=== Setup complete! ===")
    print(f"Verify: lemma table list --pod {POD}")


if __name__ == "__main__":
    main()

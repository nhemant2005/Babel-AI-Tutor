"""
One-time setup: creates all Lemma tables, deploys functions/agents/workflows,
uploads persona files. Run from D:\Gappy_Ai after `lemma auth login` and
setting LEMMA_POD env var.

Usage:
  cd D:\Gappy_Ai
  $env:LEMMA_POD = "your-pod-slug"
  python backend/setup.py
"""

import subprocess
import sys
import json
from pathlib import Path

BASE = Path(__file__).parent
ROOT = BASE.parent

def run(cmd: list[str], check: bool = True) -> subprocess.CompletedProcess:
    print(f"  > {' '.join(cmd)}")
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.stdout:
        print(f"    {result.stdout.strip()}")
    if result.returncode != 0:
        print(f"    ERROR: {result.stderr.strip()}")
        if check:
            sys.exit(1)
    return result

def main():
    print("\n=== Gappy.AI Pod Setup ===\n")

    # Tables (order matters: subjects first due to FKs)
    print("1. Creating tables...")
    for table in ["subjects", "topics", "learner_model", "sessions",
                  "plan", "content_cache", "notifications"]:
        path = BASE / "tables" / f"{table}.json"
        run(["lemma", "table", "create", "--json", path.read_text()])

    print("\n2. Deploying functions...")
    for fn_dir in sorted((BASE / "functions").iterdir()):
        fn_json = fn_dir / "function.json"
        fn_code = fn_dir / "code.py"
        if fn_json.exists() and fn_code.exists():
            run(["lemma", "function", "create",
                 "--json", fn_json.read_text(),
                 "--code", str(fn_code)])

    print("\n3. Deploying agents...")
    for agent_dir in sorted((BASE / "agents").iterdir()):
        a_json = agent_dir / "agent.json"
        a_inst = agent_dir / "instruction.md"
        if a_json.exists() and a_inst.exists():
            run(["lemma", "agent", "create",
                 "--json", a_json.read_text(),
                 "--instruction", str(a_inst)])

    print("\n4. Deploying workflows...")
    for wf in sorted((BASE / "workflows").glob("*.json")):
        run(["lemma", "workflow", "validate", "--json", wf.read_text()], check=False)
        run(["lemma", "workflow", "create", "--json", wf.read_text()])

    print("\n5. Uploading persona files...")
    run(["lemma", "files", "mkdir", "/tutor"])
    for persona in (BASE / "personas").glob("*.md"):
        run(["lemma", "files", "write", f"/tutor/{persona.name}",
             "--input", str(persona)])

    print("\n6. Uploading persona files as soul.md aliases...")
    # Default soul.md = socratic (user can change via persona selection)
    run(["lemma", "files", "write", "/tutor/soul_socratic.md",
         "--input", str(BASE / "personas" / "soul_socratic.md")])
    run(["lemma", "files", "write", "/tutor/soul_example_first.md",
         "--input", str(BASE / "personas" / "soul_example_first.md")])

    print("\n=== Setup complete! ===")
    print("Next: verify with `lemma tables list` and `lemma agents list`")

if __name__ == "__main__":
    main()

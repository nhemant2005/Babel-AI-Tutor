# Lemma Platform — GitHub Repository Reference

> Source: https://github.com/lemma-work/lemma-platform  
> Captured: 2026-06-26

---

## Table of Contents

1. [What Lemma Is](#what-lemma-is)
2. [Repo Layout](#repo-layout)
3. [Quickstart](#quickstart)
4. [Inside a Pod — Primitives](#inside-a-pod--primitives)
5. [Local-First, No Lock-In](#local-first-no-lock-in)
6. [Installation Guide](#installation-guide)
7. [Licensing](#licensing)
8. [CLI (`lemma-terminal`)](#cli-lemma-terminal)
9. [Python SDK (`lemma-sdk`)](#python-sdk-lemma-sdk)
10. [Backend Stack](#backend-stack)
11. [Frontend Stack](#frontend-stack)
12. [Development Setup](#development-setup)

---

## What Lemma Is

> "The open-source workspace where humans and AI agents work as one team."

Agents hold roles, own tasks, and follow your permissions — right alongside your teammates. Their output lands as rows in your tables, not paragraphs in a chat scrollback.

**Why not just chat?**

A chat thread is not a place where work can live. Real work runs for days or weeks. It has owners. It has state that many people and agents need to read and write. It has steps that must wait for a human decision, and actions an agent should never take alone.

Lemma provides:
- **Humans** get apps, approval queues, and the chat tools they already use.
- **Agents** get a CLI and SDKs that read and write the same state natively.
- **The pod** holds the tables, files, workflows, permissions, and approvals that make it one system instead of a pile of connectors.

**Licensing:** AGPLv3 core (backend, frontend) · Apache-2.0 SDKs/CLI/tools

---

## Repo Layout

| Path | Package | License |
|------|---------|---------|
| `lemma-backend/` | FastAPI backend, migrations, and infra Docker Compose | AGPLv3 |
| `lemma-frontend/` | Next.js frontend | AGPLv3 |
| `agentbox/` | Sandboxed agent workspace manager and runtime image | Apache-2.0 |
| `agentbox-client/` | Python client for the AgentBox workspace API | Apache-2.0 |
| `lemma-stack/` | `lemma-stack` — installer and manager for a self-contained local stack | Apache-2.0 |
| `desktop/` | Tauri macOS desktop app (thin shell around the `lemma-stack` supervisor) | AGPLv3 |
| `lemma-cli/` | `lemma-terminal` — the `lemma` CLI and terminal UI | Apache-2.0 |
| `lemma-python/` | `lemma-sdk` — Python SDK | Apache-2.0 |
| `lemma-typescript/` | `lemma-sdk` — TypeScript/JavaScript SDK for Node, browser, and React | Apache-2.0 |
| `lemma-skills/` | Built-in agent skills | Apache-2.0 |
| `docs/` | Installation and setup guides | — |
| `install.sh` | One-line bootstrap installer | — |

No git submodules — everything is a normal directory in one repo.

---

## Quickstart

**Easiest — use it with the coding agent you already have:**

```bash
uv tool install lemma-terminal
lemma skills install          # auto-detects Claude Code / Codex / OpenCode / Cursor
lemma auth login
lemma pod create my-team --with-starter
lemma chat "what can you do in this pod?"
```

To run your coding agent *inside* Lemma (picking up tasks from a shared queue):

```bash
lemma daemon start            # serves pod-assigned runs via your local Claude Code / Codex / OpenCode
```

**Run it locally:**

macOS / Linux:
```bash
curl -fsSL https://raw.githubusercontent.com/lemma-work/lemma-platform/main/install.sh | bash
```

Windows (PowerShell, Docker Desktop required):
```powershell
iwr https://raw.githubusercontent.com/lemma-work/lemma-platform/main/install.ps1 | iex
```

Stack runs at `http://127-0-0-1.sslip.io:3711` (frontend) and `http://127-0-0-1.sslip.io:8711` (API).

> **Use the `127-0-0-1.sslip.io` host, not `localhost`/`127.0.0.1`** — sign-in cookies are scoped to it.

Configure model provider and restart:

```bash
# Anthropic (Claude):
lemma-stack config set LEMMA_DEFAULT_MODEL_TYPE anthropic_compat
lemma-stack config set LEMMA_ANTHROPIC_API_KEY sk-ant-...
lemma-stack restart

# Optional but recommended — powers app connectors:
lemma-stack config set COMPOSIO_API_KEY <key>
```

Point CLI at local stack:

```bash
lemma servers select local
lemma auth login
```

**Pods are plain files — portable:**

```bash
lemma pod export ./my-team       # the whole system, as files
lemma pod import ./my-team       # ship it back — or to another machine
```

---

## Inside a Pod — Primitives

| Primitive | What it gives you |
|-----------|-------------------|
| **Tables** | Typed, queryable business data with row-level security. Leads, tickets, tasks, approvals — readable by agents, owned by the pod. |
| **Files** | Markdown memory for everything structure can't capture — preferences, playbooks, voice guides, notes. Full-text searchable, permission-scoped, read and written by agents alongside the tables. |
| **Agents** | LLM workers with a role, tool grants, and scoped access to specific tables, files, and connectors — never vague access to everything. |
| **Workflows** | Graphs that mix agents, functions, decisions, loops, waits, and human approval steps. Triggered by schedules, webhooks, table events, chat, or the API. |
| **Functions** | Deterministic logic alongside the agents — validators, transitions, actions. Not everything should be LLM reasoning. |
| **Permissions** | Roles for people *and* agents: pod-level roles, table grants, resource visibility, delegation tokens. |
| **Approvals** | Workflow steps that pause, route to a specific person, and resume on their decision — in the app or in Slack. |
| **Apps** | The operator UI your team works from, deployed at a URL, built on the same pod APIs — a single-file HTML page (no build) or a full React app. |
| **Surfaces** | Slack, Microsoft Teams, Gmail, Outlook, Telegram, WhatsApp — wired to pod agents with identity resolution and conversation linking. |

---

## Local-First, No Lock-In

- **The Mac app** — download, pick local or cloud at first run. Same product either way.
- **Your machine** — full stack self-contained on your laptop, one command with Docker or Podman.
- **Our cloud** — lemma.work runs the same open-source stack.
- **Your subscription** — already pay for Claude or ChatGPT? Lemma agents can run through your local Claude Code or Codex logins — no separate API key, no per-token bill.
- **Your keys, your models** — any Anthropic-compatible or OpenAI-compatible key or endpoint. Runtime profiles configured per pod, so different agents can run on different models.

---

## Installation Guide

### Lemma Stack (Recommended — Self-Contained)

#### Prerequisites

- macOS, Linux, or Windows 10/11
- Docker Desktop (Windows) or Podman / Docker (macOS/Linux)

#### Install

macOS / Linux:
```bash
curl -fsSL https://raw.githubusercontent.com/lemma-work/lemma-platform/main/install.sh | bash
```

Windows (PowerShell):
```powershell
iwr https://raw.githubusercontent.com/lemma-work/lemma-platform/main/install.ps1 | iex
```

#### Service URLs After Install

| Service | URL |
|---------|-----|
| Frontend | http://127-0-0-1.sslip.io:3711 |
| Backend API | http://127-0-0-1.sslip.io:8711 |
| API docs (Scalar) | http://127-0-0-1.sslip.io:8711/scalar |

#### Configure Model Provider (Required)

Config lives in `~/.lemma/local/config.toml`.

**Anthropic (Claude):**

```bash
lemma-stack config set LEMMA_DEFAULT_MODEL_TYPE anthropic_compat
lemma-stack config set LEMMA_ANTHROPIC_API_KEY sk-ant-...
# optional defaults (claude-sonnet-4-5 / claude-haiku-4-5):
lemma-stack config set LEMMA_ANTHROPIC_DEFAULT_MODEL claude-sonnet-4-5
lemma-stack config set LEMMA_ANTHROPIC_MODEL_NAMES claude-sonnet-4-5,claude-haiku-4-5
```

**OpenAI-compatible (OpenAI, Fireworks, Together, local server):**

```bash
lemma-stack config set LEMMA_DEFAULT_MODEL_TYPE openai_compat
lemma-stack config set LEMMA_OPENAI_API_KEY <key>
lemma-stack config set LEMMA_OPENAI_BASE_URL https://api.openai.com/v1
lemma-stack config set LEMMA_OPENAI_DEFAULT_MODEL gpt-4o
lemma-stack config set LEMMA_OPENAI_MODEL_NAMES gpt-4o,gpt-4o-mini
lemma-stack config set LEMMA_OPENAI_VISION_MODEL_NAMES gpt-4o
```

> `LEMMA_OPENAI_VISION_MODEL_NAMES` — subset that accepts image input (enables `view_image`). Leave empty if no models accept images.

#### Other Configuration Variables

| Variable | Purpose |
|----------|---------|
| `COMPOSIO_API_KEY` | **Recommended.** Powers app connectors (Gmail, Slack, Notion, …). |
| `SECRET_ENCRYPTION_KEY` | Fernet key for secrets at rest. Generate: `python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"` |

```bash
lemma-stack config set COMPOSIO_API_KEY <key>
lemma-stack config set SECRET_ENCRYPTION_KEY <fernet-key>
lemma-stack restart
```

#### lemma-stack Commands

```bash
lemma-stack install   [--runtime auto|docker|podman] [--channel stable|X.Y.Z] [-y]
lemma-stack start | stop [--infra] | restart | status [--json]
lemma-stack logs <service> [-f]
lemma-stack doctor [--json]
lemma-stack config list|get|set|unset|edit|path
lemma-stack db shell|sql|url
lemma-stack redis cli
lemma-stack uninstall [--purge-data]
lemma-stack self version|info
```

#### Optional: Daemon Model Overrides

`lemma daemon start` auto-discovers models from your local Claude Code / Codex / OpenCode. To override:

- `LEMMA_DAEMON_MODELS` — applies to every harness
- `LEMMA_DAEMON_CODEX_MODELS`, `LEMMA_DAEMON_CLAUDE_CODE_MODELS`, `LEMMA_DAEMON_OPENCODE_MODELS` — per harness

---

## Licensing

**AGPLv3** (server-delivered core):
- `lemma-backend/` — the FastAPI backend
- `lemma-frontend/` — the Next.js frontend and operator UI

If you modify and offer the software over a network (e.g. a hosted SaaS), you must release your modified source under the same terms.

**Apache-2.0** (client-side developer tools):
- `agentbox/`, `agentbox-client/`, `lemma-stack/`, `lemma-cli/`, `lemma-python/`, `lemma-typescript/`, `lemma-skills/`

**Trademark:** The Lemma name, logos, and marks are not granted by the software licenses. Fork the code, not the brand.

---

## CLI (`lemma-terminal`)

### Install

```bash
uv tool install lemma-terminal
```

### Quickstart

```bash
lemma auth login
lemma orgs select --save-default
lemma pods select --save-default
lemma describe                    # inventory the selected pod
```

Add `--json` to any command for machine-readable output, `--full` to expand folded fields.

### Install Lemma Skills Into Your Coding Agent

```bash
lemma skills list                                           # what's bundled
lemma skills install                                        # auto-detect Claude Code / Codex / OpenCode / Cursor
lemma skills install --target claude                        # explicit target
lemma skills install --all-skills                           # include browser + liteparse-documents
lemma skills install --target claude --all-skills
```

`install` is an **upsert** — the CLI owns these skills, re-run after upgrading to refresh them.

#### Skill Install Locations

| Target | Location (`--scope user`) | Tool |
|--------|---------------------------|------|
| `claude` | `~/.claude/skills/` | Claude Code |
| `codex` | `~/.agents/skills/` | Codex CLI |
| `opencode` | `~/.config/opencode/skills/` | OpenCode |
| `cursor` | `.cursor/skills/` (project only) | Cursor |
| `agents` | `~/.agents/skills/` | Codex + OpenCode shared |
| `all` | all of the above | — |

Use `--scope project` to install into the current directory, or `--dir PATH` for arbitrary location.

### Daemon

```bash
lemma daemon start               # connect local Claude Code / Codex / OpenCode to pod
lemma daemon status              # pid, running state, log path
lemma daemon stop
```

### Key CLI Commands

```bash
lemma tables list
lemma files ls /knowledge
lemma agent chat                 # talk to the pod's default agent
lemma pod init my-pod            # scaffold a new pod bundle on disk to import
lemma pod export ./my-team
lemma pod import ./my-team
lemma apps deploy my-app ./index.html
```

---

## Python SDK (`lemma-sdk`)

```bash
uv pip install lemma-sdk
```

### Two Entry Points

| Class | Scope | Use for |
|-------|-------|---------|
| `Pod` | one pod | almost everything — data, files, functions, agents, workflows, app operations |
| `Lemma` | org / global | org & pod discovery, org-level connector setup, tools, runtime profiles |

```python
from lemma_sdk import Pod, Lemma

pod = Pod.from_env()                     # token + pod id from env / CLI session
lemma = Lemma.from_env(org_id="org-id")  # org-scoped; lemma.pod("id") -> Pod
```

`Pod` is a context manager:

```python
with Pod.from_env() as pod:
    pod.functions.run("triage_ticket", {"ticket_id": "rec-1"})
```

> **Inside a Lemma function**, `LEMMA_TOKEN` and `LEMMA_POD_ID` are injected automatically — just call `Pod.from_env()`.

### Authentication & Configuration

Resolution order: explicit args → environment → CLI config (`~/.lemma/config.json`).

```bash
export LEMMA_TOKEN="<access-token>"
export LEMMA_POD_ID="<pod-id>"
export LEMMA_ORG_ID="<org-id>"
export LEMMA_BASE_URL="https://api.lemma.work"
export LEMMA_AUTH_URL="https://lemma.work/auth"
export LEMMA_SSL_NO_VERIFY=1              # local/self-signed only
```

Explicit construction:

```python
pod = Pod(pod_id="pod-id", org_id="org-id", token="token",
          base_url="https://api.lemma.work")
```

### Response Shapes

| Call | `.to_dict()` returns | Rows under |
|------|---------------------|-----------|
| `records.create / get / update` | bare record object (no envelope) | top-level |
| `table.create / get / update` | table detail object | top-level |
| `records.list`, `table.list` | `{"items": [...], "total": N, ...}` | `["items"]` |
| `bulk_create / bulk_update / bulk_delete` | `{"count": N}` | `["count"]` |
| `query(sql)` | `{"items": [...], "total": N}` | `["items"]` |
| `connectors.execute` | `{"result": ...}` | `["result"]` |
| `functions.run` | `{"status": ..., "output_data": ..., "logs": ...}` | top-level |

### Pod Facades

`pod.tables` · `pod.records` · `pod.queries` · `pod.files` · `pod.functions` · `pod.agents` · `pod.workflows` · `pod.schedules` · `pod.conversations` · `pod.members` · `pod.apps` · `pod.surfaces` · `pod.connectors`

### Tables & Records

```python
t = pod.table("tickets")

row = t.create({"title": "Refund", "status": "new"})   # plain dict
ticket_id = row["id"]

row = t.get(ticket_id)
t.update(ticket_id, {"status": "resolved"})
t.delete(ticket_id)

rows = pod.records.list(
    "tickets", limit=50,
    filter=[
        {"field": "status", "op": "eq", "value": "new"},
        {"field": "priority", "op": "ne", "value": "low"},
    ],
    sort=[{"field": "created_at", "direction": "desc"}],
).to_dict()["items"]

totals = pod.query(
    "select status, count(*) as total from tickets group by status"
).to_dict()["items"]
```

#### RLS vs Shared Tables

- `enable_rls: true` (default) — row-level security on. Non-admin members can only read/update/delete **their own rows**. Pod admins see all rows.
- `enable_rls: false` — shared/team tables all members can see and mutate.
- The `query` endpoint can only join across **non-RLS** tables.

### Bulk Record Operations

```python
created_count = pod.records.bulk_create("ticket_events", [
    {"ticket_id": ticket_id, "kind": "created"},
    {"ticket_id": ticket_id, "kind": "triaged"},
])

updated_count = pod.records.bulk_update("tickets", [
    {"id": id_a, "status": "resolved"},
    {"id": id_b, "status": "waiting", "priority": "urgent"},
])

deleted_count = pod.records.bulk_delete("tickets", [id_a, id_b])
```

### Files — Built-in RAG

Files uploaded to a pod are **automatically indexed**: text is extracted, chunked, and embedded — built-in RAG with no separate vector DB.

**Indexed formats (document):** PDF, DOC/DOCX, ODT, RTF, Markdown, plain text, HTML, EPUB

**Not indexed (stored only):** CSV, TSV, JSON, YAML, XLSX, images, email — keep structured data in **tables**.

Status flow: `PENDING → PROCESSING → COMPLETED` (searchable) / `NOT_REQUIRED` / `FAILED`

```python
pod.files.create_folder("/reports", description="Generated reports")
pod.files.upload("/tmp/summary.md", directory_path="/reports")

# Plain search (whole pod):
hits = pod.files.search("refund policy").to_dict()

# Directory-scoped RAG:
hits = pod.files.search(
    "refund policy",
    scope_path="/knowledge",
    scope_mode="SUBTREE",        # SUBTREE (default) or DIRECT
    search_method="HYBRID",      # TEXT, VECTOR, or HYBRID
).to_dict()

md  = pod.files.download_markdown("/knowledge/policy.pdf")  # converted markdown bytes
raw = pod.files.download("/knowledge/policy.pdf")           # bytes
kids = pod.files.list_children("/knowledge/policy.pdf")     # derived child files
```

> `/me` is each user's **private** per-user tree. All other paths are pod-shared.

### Functions, Agents, Workflows

```python
run = pod.functions.run("triage_ticket", {"ticket_id": "rec-1"}).to_dict()
# run["status"], run["output_data"], run["logs"]

conv = pod.conversations.create_for_agent("triage", title="Triage")
pod.conversations.send(str(conv.to_dict()["id"]), "Classify ticket rec-1")

wf_run = pod.workflows.create_run("nightly_review").to_dict()
# Workflow form inputs mid-run:
pod.workflows.submit_form(wf_run["id"], node_id="<form_node>", inputs={"limit": 10})
```

### Connectors (Calling External Apps)

```python
sent = pod.connectors.execute(
    "workspace-gmail",          # auth config name
    "GMAIL_SEND_EMAIL",         # operation id
    {"recipient_email": "a@example.com", "subject": "Hi", "body": "..."},
).to_dict()["result"]

# Discover before you call:
matches = pod.connectors.operations.search("workspace-gmail", "send email")
schema  = pod.connectors.operations.get("workspace-gmail", "GMAIL_SEND_EMAIL")
```

### Writing a Lemma Function

A Python file with header comments declaring types and a handler `(ctx, data) -> output`:

```python
#input_type_name: TriageInput
#output_type_name: TriageResult
#function_name: triage_ticket

from pydantic import BaseModel
from lemma_sdk import FunctionContext, Pod

class TriageInput(BaseModel):
    ticket_id: str

class TriageResult(BaseModel):
    status: str

async def triage_ticket(ctx: FunctionContext, data: TriageInput) -> TriageResult:
    pod = Pod.from_env()    # authenticated as this function's workload principal
    pod.table("tickets").update(data.ticket_id, {"status": "triaged"})
    return TriageResult(status="triaged")
```

`FunctionContext` fields: `pod_id`, `function_id`, `user_id`, `user_email`, `config`

> Functions run with **zero default access** — grant them the tables, folders, and apps they touch.

### Org & Global Usage (`Lemma`)

```python
lemma = Lemma.from_env(org_id="org-id")

org   = lemma.org.get()
pods  = lemma.pods.list()
pod   = lemma.pod("pod-id")          # -> Pod sharing this transport
me    = lemma.user.profile()

auth_configs = lemma.connectors.auth_configs.list()
accounts     = lemma.connectors.accounts.list(app="gmail")
results      = lemma.tools.web_search("vendor SLA policy", max_results=5)
```

### Typed Models

```python
from lemma_sdk.models import Record, FunctionRun, OperationExecution, Agent, Function
```

Generated request models: `lemma_sdk.openapi_client.models` (e.g. `CreateTableRequest`)

### Errors

```python
from lemma_sdk import LemmaAPIError, LemmaConfigError

try:
    pod.records.get("tickets", "missing")
except LemmaAPIError as e:
    print(e.status_code, e.code, e.message)
except LemmaConfigError:
    ...   # missing token / pod id / unreadable config
```

### Escape Hatch

```python
generated = pod.generated   # authenticated raw client for unwrapped endpoints
```

---

## Backend Stack

| Layer | Technology |
|-------|-----------|
| Framework | FastAPI |
| ORM | SQLAlchemy 2.0 async |
| Database | PostgreSQL + pgvector |
| Auth | SuperTokens cookie-based sessions |
| Message Bus | FastStream Redis |
| Job Queue | ARQ Redis |
| Validation | Pydantic v2 |
| Dependency mgmt | uv |
| Python | 3.14 |

### Backend Docs (in `lemma-backend/docs/`)

| Doc | Contents |
|-----|----------|
| `product_doc.md` | Product overview: pods, resources, workflows, agents |
| `architecture.md` | DDD module structure, UoW, domain events, repositories, API layer |
| `development.md` | Local setup, running, testing, migrations, environment variables |
| `development_rules.md` | Engineering standards, refactor checklist, anti-patterns |
| `authorization.md` | Role model, pod permissions, delegation tokens, error contract |
| `flow_document.md` | Workflow engine: node types, data flow, input mapping, API |
| `workspace-server.md` | Workspace containers and monorepo SDK/skills packages |
| `CLAUDE.md` | Quick reference for AI-assisted development |

### Connector Catalog

Native apps always imported (Slack, Jira, Confluence via `lemma_apps_config.json`; Gmail, Google Calendar, Google Drive via `lemma-connectors` package).

Composio apps imported only when `COMPOSIO_API_KEY` is set.

```bash
# Import everything
uv run python scripts/import_connector_catalog.py

# Native only
uv run python scripts/import_connector_catalog.py --provider native

# Specific apps
uv run python scripts/import_connector_catalog.py --app gmail --app slack

# Dry run
uv run python scripts/import_connector_catalog.py --dry-run

# Add Composio apps beyond the default allowlist:
COMPOSIO_EXTRA_APP_IDS=linear,notion uv run python scripts/import_connector_catalog.py
```

### Migrations

```bash
uv run alembic upgrade head
uv run alembic revision --autogenerate -m "describe_what_changed"
```

New ORM models must be imported in `migrations/env.py` before autogenerate can detect them.

### Secret Encryption

| Var | Meaning |
|-----|---------|
| `SECRET_ENCRYPTION_KEY` | Primary Fernet key. Falls back to `CONNECTOR_ENCRYPTION_KEY`, then to a local dev seed. |
| `SECRET_ENCRYPTION_KEYSET` | Optional JSON `[{"kid","key","primary"}]` for rotation |
| `SECRET_KEY_PROVIDER` | `auto` (default) → `static` env keys |

---

## Frontend Stack

- **Framework:** Next.js 16 (App Router)
- **UI:** React 19, TypeScript, Tailwind CSS
- **SDK:** Built from sibling `lemma-typescript` directory

### Frontend Configuration

All runtime configuration via `NEXT_PUBLIC_*` environment variables.

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | `https://api.localhost` | Base URL of the Lemma backend API |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | Public URL this frontend is served from |
| `NEXT_PUBLIC_AUTH_URL` | = `SITE_URL` | URL handling auth flows |
| `NEXT_PUBLIC_SESSION_TOKEN_DOMAIN` | _(empty)_ | Cookie domain for the session |
| `NEXT_PUBLIC_SHARED_SESSION_DOMAIN` | _(unset)_ | Apex domain to share login across sibling subdomains |
| `NEXT_PUBLIC_APPS_DOMAIN_SUFFIX` | _(unset)_ | Domain suffix for pod desk apps |
| `NEXT_PUBLIC_SUPPORT_EMAIL` | `deepak@lemma.work` | Contact address shown on legal pages |
| `NEXT_PUBLIC_APP_NAME` | `Lemma Auth` | Display name used by the auth portal |

Values are read at runtime (not baked in at build time) — same build can be deployed to multiple environments.

### Frontend Verification

```bash
npm run check   # design-system audit + ESLint + TypeScript + edu-anchor checks
npm test        # Vitest unit tests
npm run build   # production build (builds the local SDK first)
```

---

## Development Setup

For contributing to the platform — backend, frontend, and agentbox run on the host with hot reload; infrastructure runs in Docker/Podman.

### Prerequisites

- Python 3.14 + [uv](https://docs.astral.sh/uv/)
- Docker or Podman (for infrastructure services and e2e tests)
- Node.js 20+ and npm (for the frontend)
- [mkcert](https://github.com/FiloSottile/mkcert) — optional, for full auth flow HTTPS

### Clone and Run

```bash
git clone https://github.com/lemma-work/lemma-platform.git
cd lemma-platform
make dev         # backend + frontend + agentbox with hot reload

lemma servers select local-dev
lemma auth login
```

### Developer Ports

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3710 |
| API | http://localhost:8710 |
| Scalar docs | http://localhost:8710/scalar |
| Postgres | localhost:5432 |
| Redis | localhost:6379 |
| SuperTokens | http://localhost:3567 |

Dev stack (3710/8710) and `lemma-stack` install stack (3711/8711) coexist on the same machine.

### Useful Make Commands

```bash
make dev          # backend + frontend + agentbox with hot reload
make logs         # tail backend logs
make stop         # stop dev app processes
make stop-all     # also stop dev infra
make test-unit    # unit tests
make test-e2e     # e2e tests (requires Docker)
make test-all     # everything
make lint         # ruff lint
make migrate      # apply database migrations
make help         # full list
```

### Backend-Only Commands (from `lemma-backend/`)

```bash
make test
make lint
make migrate
make docker-build
```

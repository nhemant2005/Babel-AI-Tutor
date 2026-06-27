# Babel — AI Study Tutor

> **"Most tutors make you feel good. This one makes you better."**

Babel is an AI-powered study tutor that remembers you across sessions, builds a transparent model of your knowledge, and uses active recall to verify — not just assume — that you understand.

Built natively on [Lemma](https://lemma.work) for the Lemma National Hackathon.

---

## What makes it different

Most AI tutors are glorified chatbots. Babel is different in three ways:

**1. It shows its thinking.**
Your knowledge state is stored in a live table — topics, confidence scores, prerequisites met — not hidden in a black box. You can see it, correct it, and watch it update in real time as you answer questions.

**2. It tests, not tells.**
Active recall (retrieval practice) sits at the heart of every session. The tutor runs recall checks at session start, mid-session, and end. Confidence scores only move when you *demonstrate* understanding, not when you just read something.

**3. It remembers you.**
Session notes are auto-banked after every session. The tutor reads your history at the start of each new session — what confused you last time, what clicked, what analogies worked. It picks up exactly where you left off.

---

## Core loop

```
Upload material
  → Structural pass extracts topics + dependency graph
  → Learning landscape visualised
  → Plan generated (deadline-aware, day-of-week aware)
  → Trial session: tutor teaches, recall checks run, learner model seeds
  → Sessions continue: tutor adapts, model updates, notes bank
  → Next session: tutor picks up with context
```

---

## Tech stack

| Layer | What |
|-------|------|
| Platform | [Lemma SDK](https://lemma.work) — agents, functions, workflows, tables, files |
| Frontend | React + TypeScript + Vite + ReactFlow |
| Backend | Lemma pod (no separate server) |
| Storage | Lemma Tables (structured data) + Lemma Files (notes, material) |
| AI | Agents via Lemma (model assigned in pod) |

---

## Backend primitives

| Resource | What it does |
|----------|-------------|
| `subjects` table | One row per uploaded subject — deadline, schedule, status |
| `topics` table | Extracted topics with depth rank and dependency graph |
| `learner_model` table | Per-topic confidence, last seen, prerequisite status |
| `sessions` table | Session records — start/end, topic, Pomodoro cycles |
| `plan` table | Scheduled study plan — topic → date |
| `content_cache` table | Hash-based cache for structural processing |
| `notifications` table | In-app notifications (session notes ready, nudges) |
| `ingest-agent` | Structural pass: extracts topics, seeds learner model, writes source notes |
| `tutor-agent` | Teaching + recall check sessions |
| `note-banker-agent` | Post-session: banks notes, updates student profile, updates learner model |
| `plan-agent` | Landscape corrections and plan modifications |
| `generate-plan` function | Deterministic scheduler: topics → calendar |
| `build-session-context` function | Assembles context brief for tutor at session start |
| `check-prerequisites` function | Returns unmet prerequisites for a topic |
| `update-pomodoro` function | Tracks Pomodoro cycle count |
| `session-end` workflow | Orchestrates post-session banking |

---

## Frontend pages

| Route | Page |
|-------|------|
| `/` | Landing |
| `/onboarding/upload` | Material upload + intake questions |
| `/onboarding/persona` | Teaching persona selection |
| `/onboarding/trial` | Trial session (implicit diagnostic) |
| `/onboarding/landscape` | Landscape reveal |
| `/home` | Dashboard — calendar, today's tasks |
| `/learning` | Subject cards |
| `/subjects/:id` | Subject page — landscape graph + plan |
| `/subjects/:id/session` | Study session (3-column: material / chat / Pomodoro) |

---

## Local development

```bash
# Install frontend deps
cd frontend && npm install

# Copy env template and fill in your Lemma pod credentials
cp .env.example .env

# Start dev server (Vite proxy handles CORS for local dev)
npm run dev
```

`.env` variables:
```
VITE_LEMMA_API_URL=/lemma-api
VITE_LEMMA_AUTH_URL=https://lemma.work/auth
VITE_LEMMA_POD_ID=your-pod-id
```

---

## Deploying backend to Lemma

```bash
cd backend

# Deploy all functions
python _update_fns.py

# Deploy all agents
python _update_agents.py

# Grant table permissions (must run after every deploy — permissions reset on update)
python _grant_permissions.py
```

> **Note**: File path permissions (`pod_write_file` access) must be granted manually via the Lemma web UI — the API does not support `file_path` resource type in programmatic grants.

---

## Deploying frontend to Lemma App

```bash
cd frontend
npm run build
echo y | lemma app deploy babel --pod <your-pod-id> --source-dir dist
```

---

## Design principles

- **No reassurance theater.** No streaks, no celebration, no "great job!" Empty encouragement is cut.
- **Transparent model.** The learner model is visible and correctable, not a hidden score.
- **Active recall over passive reading.** The system tracks what you can retrieve, not what you've seen.
- **Informed consequences.** Skipping a prerequisite shows one warning — never nags again.

---

## Student personas evaluated against

- **Kenny** — slow, panics, won't admit confusion. System must surface confusion *for* him via recall checks.
- **Niko** — overconfident, will bluff. Active recall kills the bluff.
- **Chunkz** — capable but overwhelmed by planning. System handles the organising.

---

## Hackathon

Built for the **Lemma National Hackathon**.

Judging criteria: Problem clarity (35%) · Product judgment (25%) · Execution (25%) · SDK utilisation (15%)

# CLAUDE.md

**AI Study Tutor** — Gappy.AI National Hackathon. Built native on Lemma SDK.

**Pitch:** *"A tutor that actually remembers you and shows you its thinking."*

---

## Reference Documents

| File | What it is |
|------|-----------|
| `docs/lemma-docs.md` | Complete Lemma SDK documentation (all 45 pages from lemma.work/docs) |
| `docs/lemma-github.md` | GitHub repo reference: Python SDK, CLI, installation, backend stack |
| `handoff-ux-complete.md` | **Locked UX design** — all 5 flows, every screen, every decision |
| `lemma-reference.md` | Earlier Lemma notes (superseded by lemma-docs.md — check there first) |
| `competitor-analysis.md` | Competitive landscape and differentiation gaps |
| `Gappy AI Hackathon Details.docx.md` | Hackathon rules, judging criteria, submission requirements |

---

## Core Philosophy

> **Be helpful; do not perform helpfulness.**

Test any feature: *does it change the outcome, or only feel supportive?* If only feels → cut.

Cut: reassurance theater, celebration, gamified streaks, nagging nudges, warm tone substituting for understanding, faked certainty.

**Hero line (landing page):** "Most tutors make you feel good. This one makes you better."

---

## Two Measurement Backbones (Protect Both — Neither Is Decoration)

- **TIME** → Pomodoro sitting tracker (Function, session-agnostic, not shown as session clock)
- **KNOWLEDGE** → Active recall / retrieval practice (Agent Socratic loop + Table writes on result)

Both feed ONE learner model (a Table). Confidence scores are **internal only — never surfaced to the student.**

---

## Architecture Decisions (Settled)

**Two-phase processing:**
- Cheap STRUCTURAL pass on all material at onboarding → content-hash cached
- DEEP per-topic processing → fires on node click (MVP trigger). Sliding window of nearest nodes only.
- Content-hash cached — re-scope/add-material only recomputes the cheap reasoning layer.

**Learner model = a Table**, not markdown. Schema: `topic`, `confidence`, `last_seen`, `prerequisite_status`, `completion_status`.

**Second brain = 3 document types** (all stored as Lemma files):
- Source-derived notes (from uploaded material)
- Session notes (auto-banked after each session)
- Learner model lives in a Table — files are the human-readable notes layer only

**RAG:** Lemma's built-in file indexing (PDF/MD auto-chunked + embedded). No separate vector DB needed. Files are auto-indexed on upload; only document formats (PDF, DOCX, MD, TXT) are indexed — keep structured data in Tables.

**SDK constraint:** Build native on Lemma. No Hermes/Mnemosyne/Zep/Mem0/Letta. Adding them undercuts the 15% Lemma score + 25% originality criteria.

---

## Lemma Primitive Mapping

| Feature | Lemma primitive |
|---------|----------------|
| Learner model (confidence, last-seen, prerequisites per topic) | Table (`learner_model`) |
| Material ingest → markdown | Function (deterministic) or Agent (if OCR/layout judgment needed) |
| Structural pass + landscape generation | Agent (extract topics, rank by dependency) |
| Signal quality evaluation (thin response detection) | Function |
| Pomodoro sitting tracker | Function |
| Active recall session | Agent (Socratic loop) + Table writes on result |
| Content-hash caching | Function + Table (hash → cached output) |
| Session-end summary + banked note | Agent → writes to Notes (Files) |
| Plan generation | Workflow: ingest fn → structural agent → plan agent → Table write |
| Deep processing (nearest nodes sliding window) | Agent per topic, triggered on node click |
| Landscape corrections | Conversational Agent → Table update → view re-renders |
| Session notes storage | Lemma Files (auto-indexed) |

---

## UX Summary (Full detail in `handoff-ux-complete.md`)

**App structure:** Left sidebar — Home · Learning · (TBD). Bottom of sidebar: bell (notifications) + gear (settings).

**Flow 1 — Onboarding:**
- Screen 1: Landing (static, no AI, hero line, single CTA)
- Screen 2: Material upload (split: left = upload + Agent findings; right = dynamic intake questions). CTA unlocks when material processed + all questions answered + gaps resolved.
- Screen 3: Persona selection (Socratic / Example First). One tap → trial session.
- Screen 4: Trial session (~20 min, 3 internal beats: Orient → Engage → Intrigue). Agent paces. No timer shown.
- Screen 5: Landscape + schedule reveal. Modify via chat overlay (Agent advocates once, then defers).

**Flow 2 — Returning user:** Home (calendar, today's tasks, conditional return nudge) → Learning tab (subject cards) → Subject page (landscape centrepiece + learner model state per node) → Start Learning page → session.

**Flow 3 — Study session:** 3-column layout: Left = material panel (pre-populated from deep processing), Middle = chat (Teaching / Recall Check mode shown as subscript), Right = Pomodoro. Three recall check trigger points: session start, mid-session, session end. Conversation revert icon per message bubble.

**Flow 4 — Landscape inspection:** Lives on subject page. No separate view — learner model data overlaid directly on topic nodes. Corrections via conversational overlay.

**Flow 5 — Plan:** Lives on subject page. Configure days + duration → calendar repopulates automatically.

**Informed-consequence check:** One-time popup when skipping a prerequisite. Never nags after. Divergence logged. Never backward-attributes blame.

**Notifications (in-app only, MVP):** Session notes ready · Away return nudge · Plan updated · Upcoming session · Schedule conflict. Never: streaks, days missed, motivational nudges.

---

## Feature Scope (MoSCoW)

### MUST
1. Multi-format ingest → clean markdown
2. Structural pass → dependency-ranked landscape (content-hash cached, correctable)
3. Plan generation from landscape + deadline
4. Trial session (implicit diagnostic, seeds learner model)
5. Continuous-context tutor (teaches, remembers across sessions)
6. **Active recall / retrieval practice** — the knowledge backbone
7. Learner model Table (transparent, correctable)
8. Auto-banked notes (source notes + session notes)
9. Free navigation + informed-consequence check
10. Two entry modes: topic-scoped + continue-last-session

### SHOULD (if time)
Pomodoro-with-pause · stuck-detection · session-end summary · recap-on-return · graceful abandoned-session save · plan-refinement loop · confidence-decay + spaced-revision resurfacing

### WON'T (do not resurrect)
Post-exam analysis · cross-course synthesis · voice · gamification/streaks · backward causal blame attribution · emotional/panic onboarding · reassurance/celebration · push/email notifications · data encryption (MVP) · third teaching persona (MVP)

---

## Student Personas (Evaluate Every Decision Against All Three)

- **Kenny** — slow, panics, won't admit confusion. Served by: adaptive pacing, prerequisites never silently skipped, stuck-detection, active recall surfacing confusion *for* him.
- **Niko** — overconfident, will bluff. Served by: active recall killing the bluff, informed-consequence check on skipping prereqs.
- **Chunkz** — capable, overwhelmed by planning. Served by: system doing the organising. **Must-tier features must serve Kenny or Niko — Chunkz-only justifications are at most Should/Could.**

---

## Demo Core Loop

Drop material → structural pass + streaming landscape (correct one thing) → plan falls out → **trial session: tutor teaches, active-recall checks understanding, learner-model Table updates visibly** → student navigates (one informed-consequence prompt) → session ends with honest summary + banked note → return shows the tutor remembers.

**The lean-forward beat:** the transparent Table forming from real recall evidence, correctable, driving everything.

---

## Judging Criteria

| Weight | Criterion |
|--------|-----------|
| 35% | Problem clarity & real-world fit |
| 25% | Product judgment |
| 25% | Execution quality |
| 15% | SDK utilisation (Lemma) |

---

## Git Workflow

### Repository Setup (one-time)
- `git init` at `D:\Gappy_Ai`
- `.gitignore` must exclude:
  ```
  # Secrets
  .env
  .env.*
  *.env

  # Design/planning docs (not implementation)
  docs/superpowers/
  handoff-*.md
  competitor-analysis.md
  lemma-reference.md
  scoped-final-arc.md
  critic-loop-handoff.md
  message.txt
  deprecated/

  # Lemma runtime
  .lemma/

  # Node / Python
  node_modules/
  __pycache__/
  *.pyc
  dist/
  .venv/

  # SDD scratch
  .superpowers/

  # OS
  .DS_Store
  Thumbs.db
  ```
- What **IS** committed: `backend/`, `frontend/src/`, `frontend/package.json`, `frontend/vite.config.*`, `CLAUDE.md`, `docs/lemma-docs.md`, `docs/lemma-github.md`

### Commit Rules
- Commit after every task (already in plan steps)
- Use conventional commits: `feat:`, `fix:`, `chore:`, `refactor:`
- Never commit: `.env`, design docs listed above, `node_modules/`, `__pycache__/`

### Push + Merge After Phase Completion
After each phase finishes all tasks, push and merge to main:
- **Phase A done** (Tasks 1–3): `git push origin main`
- **Phase B done** (Tasks 4–7): `git push origin main`
- **Phase C done** (Tasks 8–10): `git push origin main`
- **Phase D done** (Tasks 11–12): `git push origin main`
- **Phase E done** (Tasks 13–18): `git push origin main`

If working on a feature branch: `git merge --no-ff <branch>` into main, then push.

### Remote
Set up GitHub remote before first push:
```bash
git remote add origin <repo-url>
git push -u origin main
```

---

## Open Questions

1. **Context bloat within session** — resolved: check_context_length function + Tutor Agent self-compression (Hermes pattern)
2. **Context bloat across sessions** — resolved: Note Banker writes session-notes + updates profile.md; build_session_context injects relevant history
3. **Teaching persona chatbot names** — TBD when personas finalised.
4. **Additional sidebar tabs** — Home and Learning confirmed. Others TBD.

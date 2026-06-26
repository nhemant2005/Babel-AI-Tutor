# Changelog

All notable changes to Gappy.AI (Babel) — the AI study tutor built on Lemma SDK.

---

## [Unreleased]

### Backend (Lemma Pod)
- **7 tables deployed**: subjects, topics, learner_model, sessions, plan, content_cache, notifications
- **10 functions deployed**: hash_content, cache_lookup, cache_write, build_session_context, check_context_length, check_prerequisites, check_return_nudge, evaluate_signal_quality, generate_plan, update_pomodoro
- **4 agents deployed**: ingest-agent (structural + deep processing), tutor-agent (teaching + recall checks), note-banker-agent (session notes + learner model updates), plan-agent (landscape corrections + scheduling)
- **3 workflows deployed**: onboarding (material → ingest → plan), deep_processing (per-topic on click), session_end (summary → notes → model update)
- **2 personas**: soul_socratic.md, soul_example_first.md
- Pod ID: `019f0438-7cc1-73e4-839a-d178cab4d79a`

### Frontend (React 19 + Vite 8 + Lemma JS SDK 0.5.2)
- **6 routes**: Landing, Onboarding (upload → persona → trial → landscape), Home, Learning, SubjectPage, StudySession
- **Design system**: Babel CSS token architecture with Library (warm stone) and Session (night sky) themes
- **Components**: Sidebar, Landing (hero + 3 slides), DragDropZone (drag-and-drop file upload), ChatWindow, LandscapeGraph (ReactFlow v11), PomodoroTimer, MaterialPanel, TopicNode, InformedConsequenceModal, NotificationBell
- **File upload**: Drag-and-drop supporting PDF, DOCX, MD, TXT, CSV, PPTX, XLSX — uploaded to Lemma storage at `/subjects/{id}/raw/`
- **Staged progress bar**: Animated 3-phase indicator during onboarding processing (creating → uploading → analysing)
- **CORS resolution**: Vite proxy for local dev; deployed as Lemma App (`https://babel.apps.lemma.work`) for production — auth handled natively
- **SDK audit**: All 27 Lemma SDK call sites audited and corrected (see commit `02e5fd3`):
  - `filter` → `filters` in records.list() (6 sites)
  - `functions.run()` wrapped in `{ input: { ... } }` (5 sites)
  - `conversations.send()` → `conversations.messages.send()` (1 site)
  - `conversations.listMessages()` → `conversations.messages.list()` (2 sites)
  - `conversations.create({ initial_message })` → `{ instructions: ... }` (2 sites)
  - `m.content` → `m.text` on ConversationMessage (2 sites)
  - `files.read()` → `files.download()` (1 site)
  - `workflows.run()` → `workflows.runs.create()` + `runs.submitForm()` (2 sites)
  - `(client as any)` casts removed everywhere

### Deploy
- **Lemma App**: `https://babel.apps.lemma.work`
- **Build command**: `npm run build && echo y | lemma app deploy babel --pod <id> --source-dir dist`
- **Local dev**: `npm run dev` (port 5173, proxy to lemma.work API)

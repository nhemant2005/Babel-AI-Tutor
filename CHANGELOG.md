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

### Frontend (React + Vite + Lemma JS SDK)
- **Routing**: 6 routes — Landing, Onboarding (4-step), Home, Learning, SubjectPage, StudySession
- **Design system**: Babel CSS token architecture with Library (warm stone) and Session (night sky) themes, 290-line `index.css`
- **Components**: Sidebar, Landing (hero + slides), DragDropZone (file upload), ChatWindow, LandscapeGraph (ReactFlow), PomodoroTimer, MaterialPanel, TopicNode, InformedConsequenceModal, NotificationBell
- **Lemma SDK wired**: client initialization, auth via lemma.work, pod scoped to `019f0438-...`
- **File upload**: Drag-and-drop supporting PDF, DOCX, MD, TXT, CSV, PPTX, XLSX — uploads to Lemma storage at `/subjects/{id}/raw/`
- **Pending**: LLM model assignment per agent at lemma.work, no data populated in pod yet, remote repo not configured

# Babel — Latency & Performance Issues

## Critical — Blocks rendering

- [x] **#1 Session startup: 3 sequential API calls before UI shows**
  `build-session-context` → `conversations.create` → `messages.send`, all awaited in sequence.
  User stares at "Starting session…" for 5–15s. Same problem in both `TrialSessionStep` and `StudySession.tsx`.

- [x] **#2 `Home.tsx` — two sequential fetches before anything renders**
  Fetches subjects first, then fetches plan. Nothing renders until both complete.
  Should show skeleton immediately and load in background.

- [x] **#3 `ChatWindow` — waits 2s BEFORE the first check after a send**
  ```ts
  await new Promise(r => setTimeout(r, 2000)); // waits first, then checks
  ```
  Should check immediately, then back off. Users wait an extra 2s on every message.

---

## High — Slow but doesn't block

- [x] **#4 File uploads in Onboarding are sequential, not parallel**
  ```ts
  for (const f of files) {
    await client.files.upload(f.file, ...); // one at a time
  }
  ```
  3 PDFs = 3× the upload time. Fix: `Promise.all(files.map(...))`.

- [ ] **#5 `ChatWindow` initial mount polls every 2s for up to 60s**
  Agent usually responds in 5–15s but the loop only checks every 2s.
  Reduce interval or use exponential backoff.

- [ ] **#6 `AuthWall` — `useAuth` makes a network call on every hard refresh**
  No session caching. Every hard-refresh re-authenticates before rendering anything.

- [ ] **#7 `SubjectPage` — fetches subject record on every mount**
  No caching — navigating away and back triggers another round trip.

---

## Medium — Feels sluggish

- [x] **#8 ReactFlow `nodes` and `edges` arrays recreated on every render**
  Computed inline in `LandscapeGraph` without `useMemo`. ReactFlow diffs every node every render cycle.

- [ ] **#9 No optimistic UI anywhere**
  Deletes, creates, and updates all wait for server confirmation before updating the UI.
  A delete should remove the item instantly and revert on error.

- [x] **#10 Stale closure bug in ChatWindow polling after send**
  ```ts
  const before = messages.length + 1; // captures stale value from closure
  ```
  If state hasn't updated yet, `before` is wrong and the poll loop exits early or runs too long.

- [ ] **#11 Onboarding `refresh()` polling every 2s fires across step navigations**
  The `useSubject` hook keeps polling even when the user has moved past the upload step.

---

## Low — Perceived latency / feels rough

- [ ] **#12 No skeleton/loading states on most pages**
  Blank screen or plain "Loading…" text instead of shaped skeletons.
  Makes network latency feel much worse than it is.

- [x] **#13 Fonts never load**
  `Arsenica Trial + Outfit` referenced in CSS but `@font-face` / Google Fonts import is missing.
  Browser falls back to system fonts permanently — UI always looks wrong.

- [ ] **#14 No request deduplication or shared cache**
  Navigating Home → Learning → Home fetches subjects twice.
  No React Query or context store.

- [ ] **#15 `ChatWindow` replaces entire message array every 2s during polling**
  Full array replacement on every tick instead of diffing and appending.

---

## Infrastructure (can't fully fix in frontend)

- [ ] **#16 Lemma API latency floor ~200–500ms per call**
  Every SDK call has a minimum round-trip. 4 sequential calls = 1–2s of pure network time before any compute.
  Mitigation: parallelize calls wherever possible.

- [ ] **#17 Agent inference latency 3–15s**
  LLM calls inside agents take time. The perceived wait is much worse without streaming or a live typing indicator.
  Mitigation: show a typing indicator that appears immediately while polling.

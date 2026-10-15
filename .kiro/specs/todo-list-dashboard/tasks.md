# Implementation Plan: To-Do List Dashboard

## Overview

Build a fully client-side, single-page productivity dashboard using plain HTML, CSS, and Vanilla JavaScript. No build tools, no npm, no test frameworks. Implementation proceeds in five incremental stages: project scaffold → core utilities → widgets (Greeting → Timer → Tasks → Quick Links) → theme/responsive polish → final integration. Each stage leaves the app in a runnable state. Manual browser testing is used throughout.

---

## Tasks

- [x] 1. Scaffold project structure and HTML skeleton
  - [x] 1.1 Create `index.html` with semantic sections for all four widgets
    - Add `<section>` elements for: Greeting Widget, Focus Timer, To-Do List, Quick Links
    - Include `<link>` to `css/styles.css` and `<script defer>` to `js/app.js`
    - Add theme toggle button in the page header (`data-theme` on `<html>`)
    - Add storage-unavailable banner placeholder (`role="alert" aria-live="assertive"`)
    - _Requirements: 1.7, 2.1, 3.1, 7.1, 8.1, 10.1, 10.2, 10.3_

  - [x] 1.2 Create `css/styles.css` with CSS custom properties for light and dark themes
    - Define `:root` variables for colours, font sizes, spacing scale
    - Add `[data-theme="dark"]` override block
    - Add responsive breakpoint: stack widgets vertically below 768 px (no horizontal scroll)
    - _Requirements: 8.2, 8.5, 10.2, 10.4, 10.5_

  - [x] 1.3 Create `js/app.js` with module skeleton and `DOMContentLoaded` bootstrap
    - Declare `AppState` singleton object with fields: `tasks`, `quickLinks`, `theme`, `sortOrder`, `storageAvailable`
    - Stub empty `init()` functions for each widget module (to be filled in later tasks)
    - Wire `DOMContentLoaded` listener that calls each `init()` in order
    - _Requirements: 9.1, 10.3_

- [ ] 2. Implement StorageService
  - [ ] 2.1 Implement `StorageService.load()` with safe-defaults fallback
    - Probe `localStorage` availability with `try/catch` on a test `setItem`
    - Read and `JSON.parse` keys: `tld_tasks`, `tld_quicklinks`, `tld_theme`, `tld_sort`
    - On any parse error or missing key return safe defaults (`[]`, `[]`, `'light'`, `'createdAsc'`)
    - Set `AppState.storageAvailable` and show/hide the storage banner accordingly
    - _Requirements: 6.5, 8.4, 8.6, 9.2, 9.3_

  - [ ] 2.2 Implement `StorageService.saveTasks()`, `saveQuickLinks()`, `saveTheme()`, `saveSortOrder()`
    - Each method serialises with `JSON.stringify` and writes to its `localStorage` key
    - Catch `QuotaExceededError`; return `false` on failure, `true` on success
    - _Requirements: 3.2, 5.2, 5.6, 6.6, 7.2, 8.3_

- [ ] 3. Implement GreetingWidget
  - [ ] 3.1 Implement `GreetingWidget.getGreeting(hour)` and `formatDate(date)` / `formatTime(date)`
    - `getGreeting`: map hour ranges 5-11 -> "Good Morning", 12-17 -> "Good Afternoon", 18-21 -> "Good Evening", 22-23 + 0-4 -> "Good Night"
    - `formatDate`: return "Weekday, Month D, YYYY" using `toLocaleDateString` options
    - `formatTime`: return "HH:MM:SS" zero-padded (24-h)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

  - [ ] 3.2 Implement `GreetingWidget.init()` and `tick()`
    - `init()`: call `tick()` immediately, then `setInterval(tick, 1000)`
    - `tick()`: query DOM nodes for date, time, greeting; update `textContent`
    - _Requirements: 1.2, 1.7_

- [ ] 4. Implement TimerWidget
  - [ ] 4.1 Implement `TimerWidget.formatDisplay(s)` pure function
    - Convert integer seconds [0, 1500] to "MM:SS" string (zero-padded)
    - _Requirements: 2.3_

  - [ ] 4.2 Implement `TimerWidget.init()`, `start()`, `stop()`, `reset()`, `tick()`, `updateButtonStates()`
    - `init()`: set `remainingSeconds = 1500`, render `25:00`, wire Start/Stop/Reset click listeners
    - `start()`: guard against `remainingSeconds === 0`; set interval; call `updateButtonStates()`
    - `stop()`: clear interval; call `updateButtonStates()`
    - `reset()`: clear interval; set `remainingSeconds = 1500`; render `25:00`; call `updateButtonStates()`
    - `tick()`: decrement `remainingSeconds`; update DOM; on `=== 0` stop and show timer-notice
    - `updateButtonStates()`: disable Start when running or at 00:00; disable Stop when not running
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9_

- [ ] 5. Checkpoint - verify scaffold, storage, greeting, and timer
  - Open `index.html` in a browser and manually verify: clock ticks, greeting changes by time of day, timer counts down from 25:00, Start/Stop/Reset buttons work, data persists across page reload.

- [ ] 6. Implement TaskWidget - validation and CRUD
  - [ ] 6.1 Implement `TaskWidget.validate(title, excludeId?)`
    - Return `{ ok: false, message: "..." }` for empty/whitespace titles
    - Return `{ ok: false, message: "..." }` for titles exceeding 200 characters
    - Return `{ ok: false, message: "..." }` for case-insensitive duplicates (skip `excludeId` task)
    - Return `{ ok: true, message: null }` otherwise
    - _Requirements: 3.4, 3.5, 3.6, 4.5, 4.6_

  - [ ] 6.4 Implement `TaskWidget.addTask(title)`
    - Call `validate(title)`; on failure display inline error and return early
    - Create `Task` object: `{ id: crypto.randomUUID(), title: title.trim(), completed: false, createdAt: Date.now() }`
    - Push to `AppState.tasks`; call `StorageService.saveTasks()`; call `render()`; clear and refocus input
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

  - [ ] 6.6 Implement `TaskWidget.toggleComplete(id)` and `deleteTask(id)`
    - `toggleComplete`: flip `completed` field; persist; re-render; show error if `saveTasks` returns `false`
    - `deleteTask`: remove entry from `AppState.tasks`; persist; re-render; show error if save fails
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

  - [ ] 6.9 Implement `TaskWidget.beginEdit(id)`, `confirmEdit(id, newTitle)`, `cancelEdit(id)`
    - `beginEdit`: swap title `<span>` with `<input>` pre-populated with current title; bind Save/Cancel controls and Enter/Escape keys
    - `confirmEdit`: call `validate(newTitle, id)`; on failure show inline error; on success update `title`, persist, re-render
    - `cancelEdit`: remove input; restore `<span>` without touching `AppState`
    - If `saveTasks` returns `false`, reject edit and show error per Requirement 4.7
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

- [ ] 7. Implement TaskWidget - sort and render
  - [ ] 7.1 Implement `TaskWidget.sortTasks(strategy)`
    - Return a sorted copy of `AppState.tasks`; never mutate the source array
    - Strategies: `createdAsc` (ascending `createdAt`), `createdDesc` (descending), `completionState` (incomplete first)
    - _Requirements: 6.2, 6.3_

  - [ ] 7.3 Implement `TaskWidget.render()`
    - Clear the task list DOM container
    - Apply `sortTasks(AppState.sortOrder)` to get display order
    - For each task render: checkbox (checked = completed), title `<span>` (strikethrough + opacity when complete), Edit button, Delete button
    - If `AppState.tasks` is empty, show empty-state message
    - _Requirements: 5.3, 5.4, 6.1, 6.4_

  - [ ] 7.4 Implement `TaskWidget.init()` with sort-control wiring
    - Call `render()` on init to display loaded tasks
    - Bind sort control change event: update `AppState.sortOrder`, call `StorageService.saveSortOrder()`, call `render()`
    - _Requirements: 6.1, 6.2, 6.3_

- [ ] 8. Checkpoint - verify complete TaskWidget behaviour
  - Open `index.html` in a browser and manually verify: add/edit/delete tasks, toggle completion, sort order changes, data persists across page reload.

- [ ] 9. Implement QuickLinkWidget
  - [ ] 9.1 Implement `QuickLinkWidget.validateLink(label, url)`
    - Reject empty/whitespace label or url
    - Reject URL not starting with `http://` or `https://`
    - Reject when `AppState.quickLinks.length >= 20`
    - _Requirements: 7.3, 7.4, 7.5_

  - [ ] 9.3 Implement `QuickLinkWidget.addLink(label, url)`, `deleteLink(id)`, `render()`
    - `addLink`: call `validateLink`; on success create `{ id: crypto.randomUUID(), label, url }`, push to `AppState.quickLinks`, persist, re-render
    - `deleteLink`: remove entry by `id`, persist, re-render
    - `render()`: clear container; for each link render a `<button>` that opens URL in new tab + a Delete control
    - _Requirements: 7.1, 7.2, 7.6, 7.7, 7.8, 7.10_

  - [ ] 9.4 Implement `QuickLinkWidget.init()`
    - Call `render()` to display loaded links
    - Bind Add-link form submit: call `addLink`, clear inputs, show inline error if `validateLink` fails
    - _Requirements: 7.1, 7.9_

- [ ] 10. Implement ThemeManager
  - [ ] 10.1 Implement `ThemeManager.apply(theme)`, `toggle()`, `init()`
    - `apply`: set `document.documentElement.setAttribute('data-theme', theme)`
    - `toggle`: flip `AppState.theme` between `'light'` and `'dark'`; call `apply`; call `StorageService.saveTheme()`
    - `init`: read `AppState.theme` (already hydrated from storage by bootstrap); call `apply` immediately before paint
    - Wire the theme toggle button click event to call `toggle()`
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

- [ ] 11. Wire Bootstrap and integrate all modules
  - [ ] 11.1 Complete `DOMContentLoaded` bootstrap in `app.js`
    - Call `StorageService.load()` and hydrate `AppState` with returned data
    - Show storage-unavailable banner if `AppState.storageAvailable === false`
    - Call `GreetingWidget.init()`, `TimerWidget.init()`, `TaskWidget.init()`, `QuickLinkWidget.init()`, `ThemeManager.init()` in order
    - _Requirements: 6.1, 7.9, 8.4, 9.1, 9.3_

- [ ] 12. Final checkpoint - cross-browser smoke check
  - Open `index.html` directly from the filesystem (no server) in Chrome, Firefox, and Edge
  - Verify: no console errors, all four widgets load, theme toggle works, data persists on reload, layout is responsive (resize to < 768 px)

---

## Notes

- No npm, no bundler, no transpiler - plain `<script defer src="js/app.js">` loaded directly in the browser
- All persistence uses `localStorage` with keys `tld_tasks`, `tld_quicklinks`, `tld_theme`, `tld_sort`
- The implementation language is **Vanilla JavaScript (ES2022)** - `crypto.randomUUID()`, `structuredClone()`, optional chaining, nullish coalescing are all fine
- Each task references specific requirements for full traceability

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3"] },
    { "id": 1, "tasks": ["2.1", "2.2"] },
    { "id": 2, "tasks": ["3.1", "4.1"] },
    { "id": 3, "tasks": ["3.2", "4.2"] },
    { "id": 4, "tasks": ["6.1"] },
    { "id": 5, "tasks": ["6.4", "6.6", "6.9"] },
    { "id": 6, "tasks": ["7.1"] },
    { "id": 7, "tasks": ["7.3", "7.4", "9.1"] },
    { "id": 8, "tasks": ["9.3", "9.4", "10.1"] },
    { "id": 9, "tasks": ["11.1"] }
  ]
}
```

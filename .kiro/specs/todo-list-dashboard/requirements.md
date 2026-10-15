# Requirements Document

## Introduction

The **To Do List Dashboard** is a client-side web application built with HTML, CSS, and Vanilla JavaScript. It provides users with a personal productivity dashboard that includes a time-based greeting, a Pomodoro focus timer, a task management list, and a quick-access links panel. All data is persisted using the browser's Local Storage API — no backend server or database is required. The app must work in modern browsers and can be deployed as a standalone web page or browser extension.

---

## Glossary

- **Dashboard**: The main single-page interface containing all four widget panels.
- **Task**: A single to-do item with a title, a completion state, and a creation timestamp.
- **Task_List**: The collection of all Tasks managed by the Dashboard.
- **Timer**: The Pomodoro-style countdown component set to 25 minutes by default.
- **Quick_Link**: A user-defined label and URL pair rendered as a clickable button.
- **Storage**: The browser's `localStorage` API used as the sole persistence layer.
- **Greeting_Widget**: The Dashboard panel that displays the current date, time, and a contextual greeting message.
- **Theme**: The visual color scheme of the Dashboard, either `light` or `dark`.

---

## Requirements

---

### Requirement 1: Greeting Widget

**User Story:** As a user, I want to see the current time, date, and a personalized greeting when I open the Dashboard, so that I have immediate context about the time of day.

#### Acceptance Criteria

1. THE Greeting_Widget SHALL display the current date using the full weekday name, full month name, numeric day, and four-digit year (e.g., "Wednesday, October 15, 2026").
2. WHEN the Dashboard is open, THE Greeting_Widget SHALL display the current local time in HH:MM:SS format and update it every second.
3. WHEN the current local time is between 05:00:00 and 11:59:59, THE Greeting_Widget SHALL display the greeting "Good Morning".
4. WHEN the current local time is between 12:00:00 and 17:59:59, THE Greeting_Widget SHALL display the greeting "Good Afternoon".
5. WHEN the current local time is between 18:00:00 and 21:59:59, THE Greeting_Widget SHALL display the greeting "Good Evening".
6. WHEN the current local time is between 22:00:00 and 04:59:59, THE Greeting_Widget SHALL display the greeting "Good Night".
7. WHEN the Dashboard is open, THE Greeting_Widget SHALL display the date, time, and greeting together in a single widget area without requiring any user interaction.

---

### Requirement 2: Focus Timer

**User Story:** As a user, I want a 25-minute countdown timer with Start, Stop, and Reset controls, so that I can use the Pomodoro technique to manage my focus sessions.

#### Acceptance Criteria

1. THE Timer SHALL initialize with a countdown value of 25 minutes and 00 seconds (25:00).
2. WHEN the user activates the Start control, THE Timer SHALL begin counting down one second at a time from the currently displayed time.
3. WHILE the Timer is counting down, THE Timer SHALL update the displayed time every second in MM:SS format, where MM is minutes (00–24) and SS is seconds (00–59).
4. WHEN the user activates the Stop control, THE Timer SHALL pause the countdown and retain the current remaining time without modification.
5. WHEN the user activates the Reset control, THE Timer SHALL stop any active countdown and restore the displayed time to 25:00.
6. WHEN the countdown reaches 00:00, THE Timer SHALL stop automatically and display a visible notification indicating the session has ended.
7. WHILE the Timer is counting down, THE Timer SHALL disable the Start control to prevent duplicate intervals.
8. WHILE the Timer is paused or reset, THE Timer SHALL disable the Stop control.
9. IF the user activates the Start control when the displayed time is 00:00, THE Timer SHALL NOT begin a new countdown and SHALL keep the displayed time at 00:00.

---

### Requirement 3: To-Do List — Add Tasks

**User Story:** As a user, I want to add new tasks to my to-do list, so that I can keep track of things I need to do.

#### Acceptance Criteria

1. THE Task_List SHALL provide a text input field with a maximum capacity of 200 characters and an "Add" control for creating new Tasks.
2. WHEN the user submits a non-empty task title (after trimming leading and trailing whitespace) via the Add control or the Enter key, THE Task_List SHALL append the new Task to the end of the list and persist it to Storage within 1 second.
3. WHEN a new Task is successfully added, THE Task_List SHALL clear the text input field and return focus to it.
4. IF the user attempts to submit a task title that is empty or contains only whitespace characters, THEN THE Task_List SHALL reject the submission, retain the current input field content, and display a validation message indicating the title cannot be blank.
5. IF the user attempts to submit a task title that, after trimming, matches an existing Task title in the Task_List via case-insensitive comparison, THEN THE Task_List SHALL reject the submission, retain the current input field content, and display a duplicate warning message.
6. IF the user attempts to submit a task title exceeding 200 characters, THEN THE Task_List SHALL reject the submission and display a validation message indicating the maximum character limit.
7. WHEN a new Task is created, THE Task_List SHALL set its completion state to incomplete.

---

### Requirement 4: To-Do List — Edit Tasks

**User Story:** As a user, I want to edit the title of an existing task, so that I can correct or update it without deleting and re-creating it.

#### Acceptance Criteria

1. THE Task_List SHALL provide an Edit control for each Task.
2. WHEN the user activates the Edit control on a Task, THE Task_List SHALL replace the Task title display with an editable text input pre-populated with the current title, accepting a maximum of 200 characters.
3. WHEN the user confirms the edit (via an Enter key or Save control), THE Task_List SHALL update the Task title, persist the change to Storage, and return to the display view.
4. WHEN the user cancels the edit (via an Escape key or Cancel control), THE Task_List SHALL discard changes and return to the display view without modifying Storage.
5. IF the user attempts to confirm an edit with an empty or whitespace-only title, THEN THE Task_List SHALL reject the change and display a validation message indicating that the title is required.
6. IF the user attempts to confirm an edit with a title that, after trimming leading and trailing whitespace, matches the title of a different existing Task (case-insensitive), THEN THE Task_List SHALL reject the change and display a duplicate warning message indicating that a Task with that title already exists.
7. IF Storage is unavailable when the user confirms the edit, THEN THE Task_List SHALL reject the change, retain the editable input with the user's current input, and display an error message indicating that the change could not be saved.

---

### Requirement 5: To-Do List — Complete and Delete Tasks

**User Story:** As a user, I want to mark tasks as done and delete tasks I no longer need, so that I can track my progress and keep the list clean.

#### Acceptance Criteria

1. THE Task_List SHALL provide a checkbox or toggle control for each Task to mark it as complete or incomplete.
2. WHEN the user toggles the completion control on a Task, THE Task_List SHALL update the Task's completion state and persist the change to Storage within 500 milliseconds.
3. WHEN a Task is marked complete, THE Task_List SHALL apply a visual distinction (strikethrough text and opacity reduced to 50% or less) to differentiate it from incomplete Tasks.
4. WHEN a Task is marked incomplete after previously being marked complete, THE Task_List SHALL remove the visual distinction and restore the Task to normal appearance.
5. THE Task_List SHALL provide a Delete control for each Task.
6. WHEN the user activates the Delete control on a Task, THE Task_List SHALL permanently remove the Task from the list and update Storage within 500 milliseconds, such that the deleted Task is no longer retrievable from Storage.
7. IF Storage is unavailable when the user toggles the completion control or activates the Delete control, THEN THE Task_List SHALL display an error message indicating the operation could not be saved and retain the Task's previous state.

---

### Requirement 6: To-Do List — Persistence and Sorting

**User Story:** As a user, I want my tasks to be saved across browser sessions and optionally sorted, so that I never lose my list and can view it in a useful order.

#### Acceptance Criteria

1. WHEN the Dashboard loads, THE Task_List SHALL read all Tasks from Storage and render them in the list within 500 milliseconds, preserving the last active sort order if one was previously selected.
2. THE Task_List SHALL provide sort controls allowing the user to order Tasks by exactly one of: (a) creation date ascending, (b) creation date descending, or (c) completion state (incomplete tasks first, completed tasks second).
3. WHEN the user selects a sort option, THE Task_List SHALL re-render the list in the chosen order within 300 milliseconds without modifying the underlying Storage data.
4. IF no Tasks exist in Storage on load, THEN THE Task_List SHALL display an empty-state message indicating that no tasks are present and prompting the user to add one.
5. IF Storage is unavailable or returns a read error on Dashboard load, THEN THE Task_List SHALL display an error message indicating that tasks could not be loaded and render zero tasks.
6. WHEN a Task is created, updated, or deleted, THE Task_List SHALL write the updated task collection to Storage before confirming the operation to the user.

---

### Requirement 7: Quick Links

**User Story:** As a user, I want to save and access my favorite website links as buttons on the Dashboard, so that I can quickly navigate to frequently used sites.

#### Acceptance Criteria

1. THE Dashboard SHALL provide a Quick_Link management panel with a label input (max 50 characters), a URL input (max 2048 characters), and an Add control for creating new Quick_Links, up to a maximum of 20 Quick_Links.
2. WHEN the user submits a valid label and URL, THE Dashboard SHALL render a clickable button for the Quick_Link, persist it to Storage, and display it in the panel.
3. IF the user attempts to add a Quick_Link with an empty label, whitespace-only label, or empty URL, THEN THE Dashboard SHALL reject the submission and display a validation message identifying which field failed.
4. IF the user attempts to add a Quick_Link with a URL that does not begin with `http://` or `https://`, THEN THE Dashboard SHALL reject the submission and display a format error message.
5. IF the user attempts to add a Quick_Link when 20 Quick_Links already exist, THEN THE Dashboard SHALL reject the submission and display a message indicating the maximum limit has been reached.
6. WHEN the user activates a Quick_Link button, THE Dashboard SHALL open the associated URL in a new browser tab.
7. THE Dashboard SHALL provide a Delete control for each Quick_Link button.
8. WHEN the user activates the Delete control for a Quick_Link, THE Dashboard SHALL remove it from the panel and update Storage.
9. WHEN the Dashboard loads, THE Dashboard SHALL read all Quick_Links from Storage and render the corresponding buttons.
10. IF Storage is unavailable when loading, adding, or deleting a Quick_Link, THEN THE Dashboard SHALL display an error message describing the nature of the failure and continue operating with the in-memory state for that session.

---

### Requirement 8: Light / Dark Mode Toggle

**User Story:** As a user, I want to switch between light and dark visual themes, so that I can use the Dashboard comfortably in different lighting environments.

#### Acceptance Criteria

1. THE Dashboard SHALL provide a theme toggle control that is visible and operable on every page and switches between `light` and `dark` Theme states.
2. WHEN the user activates the theme toggle, THE Dashboard SHALL apply the selected Theme's CSS styles across all widgets within 100 milliseconds without a page reload.
3. WHEN the user activates the theme toggle, THE Dashboard SHALL persist the newly selected Theme to Storage, replacing any previously stored value.
4. WHEN the Dashboard loads, THE Dashboard SHALL read the stored Theme preference from Storage and apply it before any visible content is rendered, preventing a flash of the wrong theme.
5. IF no Theme preference exists in Storage, THEN THE Dashboard SHALL default to the `light` Theme.
6. IF Storage is unavailable or returns an unrecognized value when reading Theme preference, THEN THE Dashboard SHALL default to the `light` Theme and continue operating.

---

### Requirement 9: Data Integrity and Browser Compatibility

**User Story:** As a user, I want the Dashboard to work reliably across modern browsers and recover gracefully from storage issues, so that I never lose data unexpectedly.

#### Acceptance Criteria

1. THE Dashboard SHALL function such that all widgets render, all user interactions respond, and no uncaught JavaScript errors are thrown in the latest stable release of Chrome, Firefox, Edge, and Safari at time of testing.
2. WHEN the Dashboard reads from Storage, THE Dashboard SHALL parse stored JSON data safely; IF the data is malformed or missing, THEN THE Dashboard SHALL revert to default values (empty task list, empty quick links, light theme) without throwing uncaught errors.
3. IF Storage is unavailable or throws a quota error, THEN THE Dashboard SHALL display a dismissible overlay message that does not prevent widget interaction, and continue operating with in-memory state for the session.
4. THE Dashboard SHALL load and render all widgets within 2 seconds on a machine with a mid-range CPU and no CPU throttling applied, with no network requests required.

---

### Requirement 10: Layout and Visual Design

**User Story:** As a user, I want a clean, organized layout with clear visual hierarchy, so that I can find and use each widget quickly without confusion.

#### Acceptance Criteria

1. THE Dashboard SHALL organize the Greeting_Widget, Timer, Task_List, and Quick_Links panel in a sectioned single-page layout such that each widget is identifiable as a distinct area.
2. THE Dashboard SHALL use a single CSS file located at `css/styles.css` for all styling.
3. THE Dashboard SHALL use a single JavaScript file located at `js/app.js` for all behavior and logic.
4. THE Dashboard SHALL apply font family, font size, spacing scale, and color palette consistently across all widgets in both `light` and `dark` Theme states.
5. WHILE the Dashboard is displayed on a viewport narrower than 768px, THE Dashboard SHALL stack the widgets vertically such that no horizontal scrollbar appears and no widget content overflows its container.

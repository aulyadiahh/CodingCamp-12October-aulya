/**
 * To-Do List Dashboard - script.js
 *
 * Single plain-browser JavaScript file (no ES modules, no npm).
 * Sections:
 *   - StorageService
 *   - AppState
 *   - GreetingWidget
 *   - TimerWidget
 *   - TaskWidget
 *   - QuickLinkWidget
 *   - ThemeManager
 *   - Bootstrap (DOMContentLoaded)
 */

'use strict';

// ---------------------------------------------------------------------------
// StorageService
// ---------------------------------------------------------------------------
const StorageService = {
  load() {
    const defaults = {
      tasks: [], quickLinks: [], theme: 'light',
      sortOrder: 'createdAsc', storageAvailable: true,
    };
    try {
      const probe = '__tld_probe__';
      localStorage.setItem(probe, '1');
      localStorage.removeItem(probe);
    } catch {
      AppState.storageAvailable = false;
      const banner = document.getElementById('storage-banner');
      if (banner) banner.removeAttribute('hidden');
      const dismissBtn = document.getElementById('storage-banner-dismiss');
      if (dismissBtn) dismissBtn.addEventListener('click', () => banner.setAttribute('hidden', ''));
      return { ...defaults, storageAvailable: false };
    }

    let tasks = [];
    try {
      const raw = localStorage.getItem('tld_tasks');
      if (raw !== null) { const p = JSON.parse(raw); tasks = Array.isArray(p) ? p : []; }
    } catch { tasks = []; }

    let quickLinks = [];
    try {
      const raw = localStorage.getItem('tld_quicklinks');
      if (raw !== null) { const p = JSON.parse(raw); quickLinks = Array.isArray(p) ? p : []; }
    } catch { quickLinks = []; }

    let theme = 'light';
    try {
      const raw = localStorage.getItem('tld_theme');
      if (raw === 'light' || raw === 'dark') theme = raw;
    } catch {}

    let sortOrder = 'createdAsc';
    try {
      const raw = localStorage.getItem('tld_sort');
      if (['createdAsc','createdDesc','completionState'].includes(raw)) sortOrder = raw;
    } catch {}

    const banner = document.getElementById('storage-banner');
    if (banner) banner.setAttribute('hidden', '');
    const dismissBtn = document.getElementById('storage-banner-dismiss');
    if (dismissBtn) dismissBtn.addEventListener('click', () => banner.setAttribute('hidden', ''));

    return { tasks, quickLinks, theme, sortOrder, storageAvailable: true };
  },

  saveTasks(tasks) {
    try { localStorage.setItem('tld_tasks', JSON.stringify(tasks)); return true; }
    catch (e) { console.warn('saveTasks failed:', e); return false; }
  },
  saveQuickLinks(links) {
    try { localStorage.setItem('tld_quicklinks', JSON.stringify(links)); return true; }
    catch (e) { console.warn('saveQuickLinks failed:', e); return false; }
  },
  saveTheme(theme) {
    try { localStorage.setItem('tld_theme', theme); return true; }
    catch (e) { console.warn('saveTheme failed:', e); return false; }
  },
  saveSortOrder(order) {
    try { localStorage.setItem('tld_sort', order); return true; }
    catch (e) { console.warn('saveSortOrder failed:', e); return false; }
  },
};

// ---------------------------------------------------------------------------
// AppState
// ---------------------------------------------------------------------------
const AppState = {
  tasks: [],
  quickLinks: [],
  theme: 'light',
  sortOrder: 'createdAsc',
  storageAvailable: true,
};

// ---------------------------------------------------------------------------
// GreetingWidget
// ---------------------------------------------------------------------------
const GreetingWidget = {
  getGreeting(hour) {
    if (hour >= 5  && hour <= 11) return 'Good Morning';
    if (hour >= 12 && hour <= 17) return 'Good Afternoon';
    if (hour >= 18 && hour <= 21) return 'Good Evening';
    return 'Good Night';
  },
  formatDate(date) {
    return date.toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
  },
  formatTime(date) {
    const h = String(date.getHours()).padStart(2, '0');
    const m = String(date.getMinutes()).padStart(2, '0');
    const s = String(date.getSeconds()).padStart(2, '0');
    return h + ':' + m + ':' + s;
  },
  tick() {
    const now = new Date();
    const elDate = document.getElementById('greeting-date');
    const elTime = document.getElementById('greeting-time');
    const elMsg  = document.getElementById('greeting-message');
    if (elDate) elDate.textContent = this.formatDate(now);
    if (elTime) elTime.textContent = this.formatTime(now);
    if (elMsg)  elMsg.textContent  = this.getGreeting(now.getHours());
  },
  init() {
    this.tick();
    setInterval(() => this.tick(), 1000);
  },
};

// ---------------------------------------------------------------------------
// TimerWidget
// ---------------------------------------------------------------------------
const TimerWidget = {
  remainingSeconds: 1500,
  intervalId: null,

  formatDisplay(s) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return String(m).padStart(2, '0') + ':' + String(sec).padStart(2, '0');
  },
  tick() {
    this.remainingSeconds -= 1;
    const el = document.getElementById('timer-display');
    if (el) el.textContent = this.formatDisplay(this.remainingSeconds);
    if (this.remainingSeconds <= 0) {
      this.stop();
      const notice = document.getElementById('timer-notice');
      if (notice) notice.classList.add('is-visible');
    }
    this.updateButtonStates();
  },
  start() {
    if (this.remainingSeconds <= 0 || this.intervalId !== null) return;
    const notice = document.getElementById('timer-notice');
    if (notice) notice.classList.remove('is-visible');
    this.intervalId = setInterval(() => this.tick(), 1000);
    this.updateButtonStates();
  },
  stop() {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.updateButtonStates();
  },
  reset() {
    this.stop();
    this.remainingSeconds = 1500;
    const el = document.getElementById('timer-display');
    if (el) el.textContent = this.formatDisplay(this.remainingSeconds);
    const notice = document.getElementById('timer-notice');
    if (notice) notice.classList.remove('is-visible');
    this.updateButtonStates();
  },
  updateButtonStates() {
    const btnStart = document.getElementById('timer-start');
    const btnStop  = document.getElementById('timer-stop');
    const running  = this.intervalId !== null;
    if (btnStart) btnStart.disabled = running || this.remainingSeconds <= 0;
    if (btnStop)  btnStop.disabled  = !running;
  },
  init() {
    this.remainingSeconds = 1500;
    const el = document.getElementById('timer-display');
    if (el) el.textContent = this.formatDisplay(this.remainingSeconds);
    document.getElementById('timer-start')?.addEventListener('click', () => this.start());
    document.getElementById('timer-stop')?.addEventListener('click',  () => this.stop());
    document.getElementById('timer-reset')?.addEventListener('click', () => this.reset());
    this.updateButtonStates();
  },
};

// ---------------------------------------------------------------------------
// TaskWidget
// ---------------------------------------------------------------------------
const TaskWidget = {
  validate(title, excludeId) {
    const trimmed = (title || '').trim();
    if (!trimmed) return { ok: false, message: 'Task title cannot be empty.' };
    if (trimmed.length > 200) return { ok: false, message: 'Title must be 200 characters or fewer.' };
    const lower = trimmed.toLowerCase();
    const duplicate = AppState.tasks.some(
      t => t.title.toLowerCase() === lower && t.id !== excludeId
    );
    if (duplicate) return { ok: false, message: 'A task with that title already exists.' };
    return { ok: true, message: null };
  },

  showError(elId, message) {
    const el = document.getElementById(elId);
    if (!el) return;
    if (message) { el.textContent = message; el.classList.add('is-visible'); }
    else         { el.textContent = '';      el.classList.remove('is-visible'); }
  },

  addTask(title) {
    const result = this.validate(title);
    if (!result.ok) { this.showError('task-input-error', result.message); return; }
    this.showError('task-input-error', null);
    AppState.tasks.push({
      id: crypto.randomUUID(),
      title: title.trim(),
      completed: false,
      createdAt: Date.now(),
    });
    StorageService.saveTasks(AppState.tasks);
    this.render();
    const input = document.getElementById('task-input');
    if (input) { input.value = ''; input.focus(); }
  },

  beginEdit(id) {
    const task = AppState.tasks.find(t => t.id === id);
    if (!task) return;
    const item = document.querySelector('[data-task-id="' + id + '"]');
    if (!item) return;
    const span = item.querySelector('.task-item__title');
    if (!span) return;

    const input = document.createElement('input');
    input.type = 'text';
    input.value = task.title;
    input.className = 'task-item__edit-input form-input';
    input.maxLength = 200;
    input.setAttribute('aria-label', 'Edit task title');

    const errSpan = document.createElement('span');
    errSpan.className = 'field-error';
    errSpan.setAttribute('role', 'alert');

    span.replaceWith(input);
    input.after(errSpan);
    input.focus();
    input.select();

    item.querySelectorAll('.task-item__actions .btn').forEach(b => { b.hidden = true; });

    const saveBtn   = document.createElement('button');
    saveBtn.textContent = 'Save';
    saveBtn.className   = 'btn btn--primary btn--sm';
    saveBtn.setAttribute('aria-label', 'Save edit');

    const cancelBtn   = document.createElement('button');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.className   = 'btn btn--secondary btn--sm';
    cancelBtn.setAttribute('aria-label', 'Cancel edit');

    const actionsDiv = item.querySelector('.task-item__actions');
    if (actionsDiv) { actionsDiv.appendChild(saveBtn); actionsDiv.appendChild(cancelBtn); }

    const doSave   = () => this.confirmEdit(id, input.value);
    const doCancel = () => this.cancelEdit(id);
    saveBtn.addEventListener('click',  doSave);
    cancelBtn.addEventListener('click', doCancel);
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter')  { e.preventDefault(); doSave(); }
      if (e.key === 'Escape') { e.preventDefault(); doCancel(); }
    });
  },

  confirmEdit(id, newTitle) {
    const result = this.validate(newTitle, id);
    const item = document.querySelector('[data-task-id="' + id + '"]');
    const errSpan = item ? item.querySelector('.field-error') : null;
    if (!result.ok) {
      if (errSpan) { errSpan.textContent = result.message; errSpan.classList.add('is-visible'); }
      return;
    }
    const task = AppState.tasks.find(t => t.id === id);
    if (!task) return;
    task.title = newTitle.trim();
    const saved = StorageService.saveTasks(AppState.tasks);
    if (!saved) {
      if (errSpan) { errSpan.textContent = 'Could not save — storage full.'; errSpan.classList.add('is-visible'); }
      return;
    }
    this.render();
  },

  cancelEdit(id) {
    this.render();
  },

  toggleComplete(id) {
    const task = AppState.tasks.find(t => t.id === id);
    if (!task) return;
    task.completed = !task.completed;
    StorageService.saveTasks(AppState.tasks);
    this.render();
  },

  deleteTask(id) {
    AppState.tasks = AppState.tasks.filter(t => t.id !== id);
    StorageService.saveTasks(AppState.tasks);
    this.render();
  },

  sortTasks(strategy) {
    const copy = [...AppState.tasks];
    if      (strategy === 'createdAsc')       copy.sort((a, b) => a.createdAt - b.createdAt);
    else if (strategy === 'createdDesc')      copy.sort((a, b) => b.createdAt - a.createdAt);
    else if (strategy === 'completionState')  copy.sort((a, b) => Number(a.completed) - Number(b.completed));
    return copy;
  },

  render() {
    const list     = document.getElementById('task-list');
    const emptyMsg = document.getElementById('task-empty-state');
    if (!list) return;
    list.innerHTML = '';

    if (AppState.tasks.length === 0) {
      if (emptyMsg) emptyMsg.hidden = false;
      return;
    }
    if (emptyMsg) emptyMsg.hidden = true;

    this.sortTasks(AppState.sortOrder).forEach(task => {
      const li = document.createElement('li');
      li.className = 'task-item' + (task.completed ? ' task-item--completed' : '');
      li.setAttribute('data-task-id', task.id);

      const checkbox = document.createElement('input');
      checkbox.type    = 'checkbox';
      checkbox.checked = task.completed;
      checkbox.className = 'task-item__checkbox';
      checkbox.setAttribute('aria-label',
        'Mark "' + task.title + '" as ' + (task.completed ? 'incomplete' : 'complete'));
      checkbox.addEventListener('change', () => this.toggleComplete(task.id));

      const titleSpan = document.createElement('span');
      titleSpan.className   = 'task-item__title';
      titleSpan.textContent = task.title;

      const actionsDiv = document.createElement('div');
      actionsDiv.className = 'task-item__actions';

      const editBtn = document.createElement('button');
      editBtn.textContent = 'Edit';
      editBtn.className   = 'btn btn--ghost btn--sm';
      editBtn.setAttribute('aria-label', 'Edit task: ' + task.title);
      editBtn.addEventListener('click', () => this.beginEdit(task.id));

      const delBtn = document.createElement('button');
      delBtn.textContent = 'Delete';
      delBtn.className   = 'btn btn--danger btn--sm';
      delBtn.setAttribute('aria-label', 'Delete task: ' + task.title);
      delBtn.addEventListener('click', () => this.deleteTask(task.id));

      actionsDiv.appendChild(editBtn);
      actionsDiv.appendChild(delBtn);
      li.appendChild(checkbox);
      li.appendChild(titleSpan);
      li.appendChild(actionsDiv);
      list.appendChild(li);
    });
  },

  init() {
    this.render();
    const addBtn  = document.getElementById('task-add-btn');
    const input   = document.getElementById('task-input');
    const sortSel = document.getElementById('task-sort');

    if (addBtn) addBtn.addEventListener('click', () => this.addTask(input ? input.value : ''));
    if (input)  input.addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); this.addTask(input.value); }
    });
    if (sortSel) {
      sortSel.value = AppState.sortOrder;
      sortSel.addEventListener('change', () => {
        AppState.sortOrder = sortSel.value;
        StorageService.saveSortOrder(AppState.sortOrder);
        this.render();
      });
    }
  },
};

// ---------------------------------------------------------------------------
// QuickLinkWidget
// ---------------------------------------------------------------------------
const QuickLinkWidget = {
  validateLink(label, url) {
    if (!(label || '').trim()) return { ok: false, message: 'Label cannot be empty.' };
    const u = (url || '').trim();
    if (!u) return { ok: false, message: 'URL cannot be empty.' };
    if (!u.startsWith('http://') && !u.startsWith('https://'))
      return { ok: false, message: 'URL must start with http:// or https://' };
    if (AppState.quickLinks.length >= 20)
      return { ok: false, message: 'Maximum of 20 quick links reached.' };
    return { ok: true, message: null };
  },

  addLink(label, url) {
    const result = this.validateLink(label, url);
    const errEl  = document.getElementById('quicklink-error');
    if (!result.ok) {
      if (errEl) { errEl.textContent = result.message; errEl.classList.add('is-visible'); }
      return false;
    }
    if (errEl) { errEl.textContent = ''; errEl.classList.remove('is-visible'); }
    AppState.quickLinks.push({ id: crypto.randomUUID(), label: label.trim(), url: url.trim() });
    StorageService.saveQuickLinks(AppState.quickLinks);
    this.render();
    return true;
  },

  deleteLink(id) {
    AppState.quickLinks = AppState.quickLinks.filter(l => l.id !== id);
    StorageService.saveQuickLinks(AppState.quickLinks);
    this.render();
  },

  render() {
    const container = document.getElementById('quicklinks-list');
    const emptyMsg  = document.getElementById('quicklinks-empty-state');
    if (!container) return;
    container.innerHTML = '';

    if (AppState.quickLinks.length === 0) {
      if (emptyMsg) emptyMsg.hidden = false;
      return;
    }
    if (emptyMsg) emptyMsg.hidden = true;

    AppState.quickLinks.forEach(link => {
      const item = document.createElement('div');
      item.className = 'quicklink-item';

      const btn = document.createElement('button');
      btn.type      = 'button';
      btn.className = 'quicklink-item__btn';
      btn.textContent = link.label;
      btn.setAttribute('aria-label', 'Open ' + link.label);
      btn.addEventListener('click', () => window.open(link.url, '_blank', 'noopener,noreferrer'));

      const delBtn = document.createElement('button');
      delBtn.type      = 'button';
      delBtn.className = 'quicklink-item__delete';
      delBtn.textContent = 'x';
      delBtn.setAttribute('aria-label', 'Delete link: ' + link.label);
      delBtn.addEventListener('click', () => this.deleteLink(link.id));

      item.appendChild(btn);
      item.appendChild(delBtn);
      container.appendChild(item);
    });
  },

  init() {
    this.render();
    const addBtn   = document.getElementById('quicklink-add-btn');
    const labelInp = document.getElementById('quicklink-label');
    const urlInp   = document.getElementById('quicklink-url');

    const doAdd = () => {
      const ok = this.addLink(labelInp ? labelInp.value : '', urlInp ? urlInp.value : '');
      if (ok) {
        if (labelInp) labelInp.value = '';
        if (urlInp)   urlInp.value   = '';
        if (labelInp) labelInp.focus();
      }
    };

    if (addBtn) addBtn.addEventListener('click', doAdd);
    if (urlInp) urlInp.addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); doAdd(); }
    });
  },
};

// ---------------------------------------------------------------------------
// ThemeManager
// ---------------------------------------------------------------------------
const ThemeManager = {
  apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const btn  = document.getElementById('theme-toggle');
    const icon = btn ? btn.querySelector('.theme-toggle__icon') : null;
    const label = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
    if (icon) icon.textContent = theme === 'dark' ? '\u2600\uFE0F' : '\uD83C\uDF19';
    if (btn)  { btn.setAttribute('aria-label', label); btn.setAttribute('title', label); }
  },
  toggle() {
    AppState.theme = AppState.theme === 'dark' ? 'light' : 'dark';
    this.apply(AppState.theme);
    StorageService.saveTheme(AppState.theme);
  },
  init() {
    this.apply(AppState.theme);
    const btn = document.getElementById('theme-toggle');
    if (btn) btn.addEventListener('click', () => this.toggle());
  },
};

// ---------------------------------------------------------------------------
// Bootstrap
// ---------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', function () {
  const stored = StorageService.load();
  if (stored) {
    AppState.tasks            = stored.tasks            || [];
    AppState.quickLinks       = stored.quickLinks       || [];
    AppState.theme            = stored.theme            || 'light';
    AppState.sortOrder        = stored.sortOrder        || 'createdAsc';
    AppState.storageAvailable = stored.storageAvailable !== false;
  }

  if (!AppState.storageAvailable) {
    const banner = document.getElementById('storage-banner');
    if (banner) banner.removeAttribute('hidden');
  }

  GreetingWidget.init();
  TimerWidget.init();
  TaskWidget.init();
  QuickLinkWidget.init();
  ThemeManager.init();
});
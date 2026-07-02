import { IDefaultFileBrowser } from '@jupyterlab/filebrowser';

/**
 * Shared singleton that holds a reference to the JupyterLab file browser
 * so that the MIME renderer (which cannot DI it directly) can still
 * list files from the current directory.
 */

let _browser: IDefaultFileBrowser | null = null;
let _currentPath = '';

type PathChangeListener = (path: string) => void;
const _listeners: PathChangeListener[] = [];

/**
 * Called once by the companion plugin to inject the file browser model.
 */
export function setFileBrowser(browser: IDefaultFileBrowser): void {
  _browser = browser;
  _currentPath = browser.model.path;

  // Notify all listeners of the initial path so components that
  // mounted before the browser was captured can update.
  _listeners.forEach(fn => fn(_currentPath));

  browser.model.pathChanged.connect((_sender, args) => {
    _currentPath = args.newValue;
    _listeners.forEach(fn => fn(_currentPath));
  });
}

/**
 * Return the current path shown in the file browser (empty string = root).
 */
export function getCurrentPath(): string {
  return _currentPath;
}

/**
 * Register a callback that fires every time the file-browser path changes.
 */
export function onPathChange(fn: PathChangeListener): void {
  _listeners.push(fn);
}

/**
 * Remove a previously-registered path-change listener.
 */
export function offPathChange(fn: PathChangeListener): void {
  const idx = _listeners.indexOf(fn);
  if (idx !== -1) {
    _listeners.splice(idx, 1);
  }
}

/**
 * Return the names of files in the current directory whose extensions
 * match one of `types`.
 */
export function getFileList(types: string[]): string[] {
  if (!_browser) {
    return [];
  }
  const items = _browser.model.items();
  if (!items) {
    return [];
  }

  const result: string[] = [];
  for (const item of items) {
    if (item.type !== 'file') {
      continue;
    }
    const ext = item.name.split('.').pop()?.toLowerCase() || '';
    if (types.includes(ext)) {
      result.push(item.name);
    }
  }
  return result;
}

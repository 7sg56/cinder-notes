/**
 * Check if the app is running inside a Tauri webview.
 * Returns false when running in a plain browser (e.g. Playwright E2E tests).
 */
export function isTauri(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

/**
 * Check if the app is running on macOS.
 */
export function isMac(): boolean {
  return (
    typeof navigator !== 'undefined' && navigator.userAgent.includes('Mac')
  );
}

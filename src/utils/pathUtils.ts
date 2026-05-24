/**
 * Cross-platform path utilities for Tauri apps.
 *
 * On macOS paths use `/`, on Windows paths use `\`.
 * These helpers ensure the frontend constructs and parses paths
 * correctly regardless of the host OS.
 */

/** Platform-aware path separator (backslash on Windows, forward slash elsewhere) */
export const SEP = navigator.userAgent.includes('Windows') ? '\\' : '/';

/** Join path segments using the platform separator */
export function joinPath(...parts: string[]): string {
  return parts.join(SEP);
}

/** Get the basename (last segment) of a path, handling both separators */
export function basename(path: string): string {
  const lastSlash = Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\'));
  return lastSlash >= 0 ? path.substring(lastSlash + 1) : path;
}

/** Get the directory portion of a path, handling both separators */
export function dirname(path: string): string {
  const lastSlash = Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\'));
  return lastSlash >= 0 ? path.substring(0, lastSlash) : path;
}

/** Split a path into segments, handling both separators */
export function splitPath(path: string): string[] {
  return path.split(/[/\\]/).filter(Boolean);
}

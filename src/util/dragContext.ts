/**
 * Module-level drag context.
 *
 * HTML5 Drag & Drop blocks `dataTransfer.getData()` during `dragover` events
 * (only available in `drop`). This module stores the current drag payload so
 * drop targets can inspect what is being dragged and decide whether to show
 * overlay indicators.
 */

export interface DragPayload {
  /** The file/node ID being dragged */
  fileId: string;
  /** Source pane ID if dragged from a tab, null if from sidebar */
  sourcePaneId: string | null;
  /** Whether the dragged item is a folder */
  isFolder: boolean;
}

let currentDrag: DragPayload | null = null;

export function setCurrentDrag(payload: DragPayload | null) {
  currentDrag = payload;
}

export function getCurrentDrag(): DragPayload | null {
  return currentDrag;
}

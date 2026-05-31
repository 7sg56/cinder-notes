import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';
import { useAppStore } from './useAppStore';
import { registerSplitStore } from './storeBridge';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface PaneState {
  activeFileId: string | null;
  openFiles: string[];
  activeFileContent: string;
}

export type SplitNode =
  | { type: 'leaf'; paneId: string }
  | {
      type: 'branch';
      axis: 'horizontal' | 'vertical';
      children: SplitNode[];
      flexes: number[];
    };

// ─── Helpers ────────────────────────────────────────────────────────────────

let paneCounter = 0;
function generatePaneId(): string {
  return `pane-${++paneCounter}`;
}

function createEmptyPane(): PaneState {
  return {
    activeFileId: null,
    openFiles: [],
    activeFileContent: '',
  };
}

/** Collect all pane IDs in the tree */
function collectPaneIds(node: SplitNode): string[] {
  if (node.type === 'leaf') return [node.paneId];
  return node.children.flatMap(collectPaneIds);
}

/** Replace a node in the tree identified by path */
function replaceNodeAtPath(
  root: SplitNode,
  path: number[],
  replacer: (node: SplitNode) => SplitNode
): SplitNode {
  if (path.length === 0) return replacer(root);
  if (root.type !== 'branch') return root;

  const [head, ...rest] = path;
  const newChildren = root.children.map((child, i) =>
    i === head ? replaceNodeAtPath(child, rest, replacer) : child
  );
  return { ...root, children: newChildren };
}

/** Find the path from root to a paneId */
function findPanePath(node: SplitNode, paneId: string): number[] | null {
  if (node.type === 'leaf') {
    return node.paneId === paneId ? [] : null;
  }
  for (let i = 0; i < node.children.length; i++) {
    const subPath = findPanePath(node.children[i], paneId);
    if (subPath !== null) return [i, ...subPath];
  }
  return null;
}

/**
 * Remove a pane from the tree and collapse single-child branches.
 * Returns the new root node, or null if the tree is empty.
 */
function removePaneFromTree(node: SplitNode, paneId: string): SplitNode | null {
  if (node.type === 'leaf') {
    return node.paneId === paneId ? null : node;
  }

  const newChildren: SplitNode[] = [];
  const newFlexes: number[] = [];

  for (let i = 0; i < node.children.length; i++) {
    const result = removePaneFromTree(node.children[i], paneId);
    if (result !== null) {
      newChildren.push(result);
      newFlexes.push(node.flexes[i]);
    }
  }

  if (newChildren.length === 0) return null;
  if (newChildren.length === 1) return newChildren[0]; // Collapse single-child

  // Normalize flexes
  const total = newFlexes.reduce((a, b) => a + b, 0);
  const normalizedFlexes = newFlexes.map((f) => f / total);

  return { ...node, children: newChildren, flexes: normalizedFlexes };
}

function getPaneDepth(root: SplitNode, paneId: string): number {
  const path = findPanePath(root, paneId);
  return path ? path.length : 0;
}

function insertPaneIntoTree(
  root: SplitNode,
  targetPaneId: string,
  newPaneId: string,
  direction: 'horizontal' | 'vertical',
  insertBefore: boolean = false
): SplitNode | null {
  const panePath = findPanePath(root, targetPaneId);
  if (panePath === null) return null;

  // Navigate to the actual parent branch
  let actualParent: SplitNode | null = root;
  for (let i = 0; i < panePath.length - 1; i++) {
    if (actualParent?.type !== 'branch') {
      actualParent = null;
      break;
    }
    actualParent = actualParent.children[panePath[i]];
  }

  if (
    actualParent?.type === 'branch' &&
    actualParent.axis === direction &&
    panePath.length > 0
  ) {
    // Parent axis matches: insert new pane as a sibling
    const childIdx = panePath[panePath.length - 1];
    const newChildren = [...actualParent.children];
    const newFlexes = [...actualParent.flexes];

    const currentFlex = newFlexes[childIdx];
    newFlexes[childIdx] = currentFlex / 2;

    const insertIdx = insertBefore ? childIdx : childIdx + 1;
    newChildren.splice(insertIdx, 0, { type: 'leaf', paneId: newPaneId });
    newFlexes.splice(insertIdx, 0, currentFlex / 2);

    const updatedParent: SplitNode = {
      ...actualParent,
      children: newChildren,
      flexes: newFlexes,
    };

    if (panePath.length === 1) {
      return updatedParent;
    } else {
      const pathToParent = panePath.slice(0, -1);
      return replaceNodeAtPath(root, pathToParent, () => updatedParent);
    }
  } else {
    // Different axis or root leaf: wrap in a new branch
    const leafExisting: SplitNode = { type: 'leaf', paneId: targetPaneId };
    const leafNew: SplitNode = { type: 'leaf', paneId: newPaneId };
    const children = insertBefore
      ? [leafNew, leafExisting]
      : [leafExisting, leafNew];

    const newBranch: SplitNode = {
      type: 'branch',
      axis: direction,
      children,
      flexes: [0.5, 0.5],
    };

    return replaceNodeAtPath(root, panePath, () => newBranch);
  }
}

// ─── Initial State ──────────────────────────────────────────────────────────

const initialPaneId = generatePaneId();

// ─── Store ──────────────────────────────────────────────────────────────────

interface SplitStoreState {
  rootNode: SplitNode;
  panes: Record<string, PaneState>;
  activePaneId: string;
  maximizedPaneId: string | null;
  newTabCounter: number;

  // Tree actions
  splitPane: (paneId: string, direction: 'horizontal' | 'vertical') => void;
  splitPaneWithFile: (
    paneId: string,
    direction: 'horizontal' | 'vertical',
    fileId: string,
    sourcePaneId: string,
    insertBefore?: boolean
  ) => void;
  closePane: (paneId: string) => void;
  setActivePaneId: (paneId: string) => void;
  toggleMaximizePane: (paneId: string) => void;
  setSplitRatio: (
    branchPath: number[],
    childIndex: number,
    delta: number
  ) => void;
  resetFlexes: (branchPath: number[]) => void;

  // Pane-scoped file actions
  paneSelectFile: (paneId: string, fileId: string) => void;
  paneCloseFile: (paneId: string, fileId: string) => void;
  paneSetActiveContent: (paneId: string, content: string) => void;
  paneCreateNewTab: (paneId: string) => void;
  paneCloseOtherFiles: (paneId: string, fileId: string) => void;
  paneCloseAllFiles: (paneId: string) => void;
  paneUpdateFileContent: (
    paneId: string,
    fileId: string,
    content: string
  ) => void;
  paneOpenFileInNewTab: (paneId: string, fileId: string) => void;
  paneOpenSystemTab: (paneId: string, tabId: string) => void;
  paneCloseFileOnly: (paneId: string, fileId: string) => void;

  // Init/reset
  resetToSinglePane: () => void;
}

export const useSplitStore = create<SplitStoreState>()((set, get) => ({
  rootNode: { type: 'leaf', paneId: initialPaneId },
  panes: { [initialPaneId]: createEmptyPane() },
  activePaneId: initialPaneId,
  maximizedPaneId: null,
  newTabCounter: 0,

  // ─── Tree Actions ───────────────────────────────────────────────────────

  splitPane: (paneId, direction) => {
    const state = get();
    const pane = state.panes[paneId];
    if (!pane) return;

    // Limit splitting to depth 2 (e.g. one horizontal, one vertical max)
    if (getPaneDepth(state.rootNode, paneId) >= 2) return;

    const newPaneId = generatePaneId();
    const newPane: PaneState = {
      // Inherit active file from the source pane (like Zed)
      activeFileId: pane.activeFileId,
      openFiles: pane.activeFileId ? [pane.activeFileId] : [],
      activeFileContent: pane.activeFileContent,
    };

    const newRoot = insertPaneIntoTree(
      state.rootNode,
      paneId,
      newPaneId,
      direction
    );
    if (!newRoot) return;

    set({
      rootNode: newRoot,
      panes: { ...state.panes, [newPaneId]: newPane },
      activePaneId: newPaneId,
      maximizedPaneId: null, // Clear maximize on split
    });
  },

  splitPaneWithFile: (
    paneId,
    direction,
    fileId,
    sourcePaneId,
    insertBefore = false
  ) => {
    const state = get();
    const targetPane = state.panes[paneId];
    if (!targetPane) return;

    // Check if target pane is empty. If so, just open the file there.
    if (
      targetPane.openFiles.length === 0 ||
      targetPane.activeFileId === 'welcome' ||
      targetPane.activeFileId === null
    ) {
      if (sourcePaneId) {
        get().paneCloseFile(sourcePaneId, fileId);
      }
      get().paneSelectFile(paneId, fileId);
      return;
    }

    // First, close the file from the source pane (if it exists)
    const updatedPanes = { ...state.panes };
    if (sourcePaneId && updatedPanes[sourcePaneId]) {
      const srcPane = updatedPanes[sourcePaneId];
      const newOpenFiles = srcPane.openFiles.filter(
        (id: string) => id !== fileId
      );
      const wasActive = srcPane.activeFileId === fileId;
      updatedPanes[sourcePaneId] = {
        ...srcPane,
        openFiles: newOpenFiles,
        activeFileId: wasActive
          ? (newOpenFiles[newOpenFiles.length - 1] ?? null)
          : srcPane.activeFileId,
        activeFileContent: wasActive ? '' : srcPane.activeFileContent,
      };

      // If the source pane became empty and it's not the target pane,
      // we might want to auto-close it. But since we are about to update the tree,
      // let's do it after the state update to avoid conflicts.
    }

    // Create the new pane with the dropped file
    const newPaneId = generatePaneId();
    const newPane: PaneState = {
      activeFileId: fileId,
      openFiles: [fileId],
      activeFileContent: '',
    };

    // Load file content
    const appState = useAppStore.getState();
    const file = appState.findFile(fileId);
    if (file?.path) {
      invoke<string>('read_note', { path: file.path })
        .then((content) => {
          const current = get().panes[newPaneId];
          if (current?.activeFileId === fileId) {
            set({
              panes: {
                ...get().panes,
                [newPaneId]: { ...current, activeFileContent: content },
              },
            });
          }
        })
        .catch(console.error);
    }

    // Limit splitting to depth 2
    if (getPaneDepth(state.rootNode, paneId) >= 2) {
      // If we can't split, just move/open the file in the target pane
      if (sourcePaneId) {
        get().paneCloseFile(sourcePaneId, fileId);
      }
      get().paneSelectFile(paneId, fileId);
      return;
    }

    // Build tree using helper
    const newRoot = insertPaneIntoTree(
      state.rootNode,
      paneId,
      newPaneId,
      direction,
      insertBefore
    );
    if (!newRoot) return;

    set({
      rootNode: newRoot,
      panes: { ...updatedPanes, [newPaneId]: newPane },
      activePaneId: newPaneId,
      maximizedPaneId: null, // Clear maximize on split
    });

    // Cleanup empty source pane if needed
    if (sourcePaneId && sourcePaneId !== newPaneId) {
      const currentSourcePane = get().panes[sourcePaneId];
      if (currentSourcePane && currentSourcePane.openFiles.length === 0) {
        get().closePane(sourcePaneId);
      }
    }
  },

  closePane: (paneId) => {
    const state = get();
    const allPanes = collectPaneIds(state.rootNode);

    // Don't close the last pane
    if (allPanes.length <= 1) return;

    const newRoot = removePaneFromTree(state.rootNode, paneId);
    if (!newRoot) return;

    // Remove pane state
    const newPanes = { ...state.panes };
    delete newPanes[paneId];

    // If the closed pane was active, pick a neighbor
    let newActivePaneId = state.activePaneId;
    if (state.activePaneId === paneId) {
      const remainingPanes = collectPaneIds(newRoot);
      newActivePaneId = remainingPanes[0] || state.activePaneId;
    }

    set({
      rootNode: newRoot,
      panes: newPanes,
      activePaneId: newActivePaneId,
      maximizedPaneId:
        state.maximizedPaneId === paneId ? null : state.maximizedPaneId,
    });
  },

  setActivePaneId: (paneId) => {
    set({ activePaneId: paneId });
  },

  setSplitRatio: (branchPath, childIndex, delta) => {
    const state = get();

    const updateBranch = (node: SplitNode): SplitNode => {
      let current = node;
      for (const idx of branchPath) {
        if (current.type !== 'branch') return node;
        current = current.children[idx];
      }

      if (current.type !== 'branch') return node;

      const branch = current;
      const newFlexes = [...branch.flexes];
      const minFlex = 0.1; // Minimum 10%

      // Adjust adjacent flexes
      const left = newFlexes[childIndex];
      const right = newFlexes[childIndex + 1];
      const total = left + right;

      let newLeft = left + delta;
      let newRight = right - delta;

      // Clamp
      if (newLeft < minFlex * total) {
        newLeft = minFlex * total;
        newRight = total - newLeft;
      }
      if (newRight < minFlex * total) {
        newRight = minFlex * total;
        newLeft = total - newRight;
      }

      newFlexes[childIndex] = newLeft;
      newFlexes[childIndex + 1] = newRight;

      const updatedBranch: SplitNode = { ...branch, flexes: newFlexes };

      // Replace in tree
      if (branchPath.length === 0) return updatedBranch;
      return replaceNodeAtPath(node, branchPath, () => updatedBranch);
    };

    set({ rootNode: updateBranch(state.rootNode) });
  },

  resetFlexes: (branchPath) => {
    const state = get();

    let target: SplitNode = state.rootNode;
    for (const idx of branchPath) {
      if (target.type !== 'branch') return;
      target = target.children[idx];
    }
    if (target.type !== 'branch') return;

    const n = target.children.length;
    const equalFlexes = Array(n).fill(1 / n);
    const updatedBranch: SplitNode = { ...target, flexes: equalFlexes };

    const newRoot =
      branchPath.length === 0
        ? updatedBranch
        : replaceNodeAtPath(state.rootNode, branchPath, () => updatedBranch);

    set({ rootNode: newRoot });
  },

  // ─── Pane-Scoped File Actions ───────────────────────────────────────────

  paneSelectFile: (paneId, fileId) => {
    const state = get();
    const pane = state.panes[paneId];
    if (!pane) return;

    // Handle blank tabs
    if (fileId.startsWith('new-tab-')) {
      const newPanes = { ...state.panes };
      if (!pane.activeFileId) {
        newPanes[paneId] = {
          ...pane,
          activeFileId: fileId,
          activeFileContent: '',
          openFiles: [fileId],
        };
      } else {
        newPanes[paneId] = {
          ...pane,
          activeFileId: fileId,
          activeFileContent: '',
        };
      }
      set({ panes: newPanes, activePaneId: paneId });
      return;
    }

    // Handle system tabs
    if (fileId.startsWith('cinder-')) {
      const newPanes = { ...state.panes };
      const openFiles = pane.openFiles.includes(fileId)
        ? pane.openFiles
        : pane.activeFileId === null || fileId.startsWith('new-tab-')
          ? pane.openFiles.map((id) => (id === pane.activeFileId ? fileId : id))
          : [...pane.openFiles, fileId];

      newPanes[paneId] = {
        ...pane,
        activeFileId: fileId,
        activeFileContent: '',
        openFiles,
      };
      set({ panes: newPanes, activePaneId: paneId });
      return;
    }

    // Regular file
    const appStore = useAppStore.getState();
    const file = appStore.findFile(fileId);
    if (!file || file.type !== 'file') return;

    const filePath = file.path;

    // Determine new openFiles
    let newOpenFiles: string[];
    if (pane.activeFileId && pane.activeFileId.startsWith('new-tab-')) {
      // Replace the blank/welcome tab
      newOpenFiles = pane.openFiles.map((id) =>
        id === pane.activeFileId ? fileId : id
      );
    } else {
      newOpenFiles = pane.openFiles.includes(fileId)
        ? pane.openFiles
        : [...pane.openFiles, fileId];
    }

    // Update pane state immediately
    const newPanes = { ...state.panes };
    newPanes[paneId] = {
      ...pane,
      activeFileId: fileId,
      activeFileContent: '',
      openFiles: newOpenFiles,
    };
    set({ panes: newPanes, activePaneId: paneId });

    // Read content from disk
    if (filePath) {
      invoke<string>('read_note', { path: filePath })
        .then((content) => {
          const currentState = get();
          const currentPane = currentState.panes[paneId];
          if (currentPane?.activeFileId === fileId) {
            const updatedPanes = { ...currentState.panes };
            updatedPanes[paneId] = {
              ...currentPane,
              activeFileContent: content,
            };
            set({ panes: updatedPanes });
          }
        })
        .catch((err) => {
          console.error('Failed to read file:', err);
          const currentState = get();
          const currentPane = currentState.panes[paneId];
          if (currentPane?.activeFileId === fileId) {
            const updatedPanes = { ...currentState.panes };
            updatedPanes[paneId] = {
              ...currentPane,
              activeFileContent: `Error loading file: ${err}`,
            };
            set({ panes: updatedPanes });
          }
        });
    } else {
      // In-memory fallback
      const newPanesUpdate = { ...get().panes };
      newPanesUpdate[paneId] = {
        ...newPanesUpdate[paneId],
        activeFileContent: file.content || '',
      };
      set({ panes: newPanesUpdate });
    }
  },

  paneOpenFileInNewTab: (paneId, fileId) => {
    const state = get();
    const pane = state.panes[paneId];
    if (!pane) return;

    const appStore = useAppStore.getState();
    const file = appStore.findFile(fileId);
    if (!file || file.type !== 'file') return;

    const filePath = file.path;

    let newOpenFiles: string[];
    if (pane.activeFileId && pane.activeFileId.startsWith('new-tab-')) {
      newOpenFiles = pane.openFiles.map((id) =>
        id === pane.activeFileId ? fileId : id
      );
    } else {
      newOpenFiles = pane.openFiles.includes(fileId)
        ? pane.openFiles
        : [...pane.openFiles, fileId];
    }

    const newPanes = { ...state.panes };
    newPanes[paneId] = {
      ...pane,
      activeFileId: fileId,
      activeFileContent: '',
      openFiles: newOpenFiles,
    };
    set({ panes: newPanes, activePaneId: paneId });

    if (filePath) {
      invoke<string>('read_note', { path: filePath })
        .then((content) => {
          const currentState = get();
          const currentPane = currentState.panes[paneId];
          if (currentPane?.activeFileId === fileId) {
            const updatedPanes = { ...currentState.panes };
            updatedPanes[paneId] = {
              ...currentPane,
              activeFileContent: content,
            };
            set({ panes: updatedPanes });
          }
        })
        .catch((err) => {
          console.error('Failed to read file:', err);
        });
    } else {
      const updPanes = { ...get().panes };
      updPanes[paneId] = {
        ...updPanes[paneId],
        activeFileContent: file.content || '',
      };
      set({ panes: updPanes });
    }
  },

  paneOpenSystemTab: (paneId, tabId) => {
    const state = get();
    const pane = state.panes[paneId];
    if (!pane) return;

    let newOpenFiles: string[];
    if (pane.openFiles.includes(tabId)) {
      newOpenFiles = pane.openFiles;
    } else if (!pane.activeFileId || pane.activeFileId.startsWith('new-tab-')) {
      newOpenFiles = pane.openFiles.map((id) =>
        id === pane.activeFileId ? tabId : id
      );
    } else {
      newOpenFiles = [...pane.openFiles, tabId];
    }

    const newPanes = { ...state.panes };
    newPanes[paneId] = {
      ...pane,
      activeFileId: tabId,
      activeFileContent: '',
      openFiles: newOpenFiles,
    };
    set({ panes: newPanes, activePaneId: paneId });
  },

  paneCloseFile: (paneId, fileId) => {
    const state = get();
    const pane = state.panes[paneId];
    if (!pane) return;

    const newOpenFiles = pane.openFiles.filter((id) => id !== fileId);

    // Auto-close pane if it becomes empty
    if (newOpenFiles.length === 0) {
      const allPanes = collectPaneIds(state.rootNode);
      if (allPanes.length > 1) {
        get().closePane(paneId);
        return;
      } else {
        // If it's the last pane, just show welcome screen (empty state)
        set({
          panes: {
            ...state.panes,
            [paneId]: {
              ...pane,
              activeFileId: null,
              activeFileContent: '',
              openFiles: [],
            },
          },
        });
        return;
      }
    }

    const newPanes = { ...state.panes };

    if (pane.activeFileId === fileId) {
      const nextActive =
        newOpenFiles.length > 0 ? newOpenFiles[newOpenFiles.length - 1] : null;

      if (nextActive) {
        // Set the new active file, then trigger content load
        newPanes[paneId] = {
          ...pane,
          activeFileId: nextActive,
          activeFileContent: '',
          openFiles: newOpenFiles,
        };
        set({ panes: newPanes });
        // Trigger content load for the next active file
        get().paneSelectFile(paneId, nextActive);
      } else {
        newPanes[paneId] = {
          ...pane,
          activeFileId: null,
          activeFileContent: '',
          openFiles: newOpenFiles,
        };
        set({ panes: newPanes });
      }
    } else {
      newPanes[paneId] = {
        ...pane,
        openFiles: newOpenFiles,
      };
      set({ panes: newPanes });
    }
  },

  /** Close a file from openFiles without switching active file content */
  paneCloseFileOnly: (paneId, fileId) => {
    const state = get();
    const pane = state.panes[paneId];
    if (!pane) return;

    const newOpenFiles = pane.openFiles.filter((id) => id !== fileId);
    const newPanes = { ...state.panes };
    newPanes[paneId] = { ...pane, openFiles: newOpenFiles };
    set({ panes: newPanes });
  },

  paneSetActiveContent: (paneId, content) => {
    const state = get();
    const pane = state.panes[paneId];
    if (!pane) return;

    const newPanes = { ...state.panes };
    newPanes[paneId] = { ...pane, activeFileContent: content };
    set({ panes: newPanes });
  },

  paneCreateNewTab: (paneId) => {
    const state = get();
    const pane = state.panes[paneId];
    if (!pane) return;

    const newCounter = state.newTabCounter + 1;
    const newTabId = `new-tab-${newCounter}`;

    const newPanes = { ...state.panes };

    if (!pane.activeFileId || pane.activeFileId === 'welcome') {
      newPanes[paneId] = {
        activeFileId: newTabId,
        openFiles: [newTabId],
        activeFileContent: '',
      };
    } else {
      newPanes[paneId] = {
        ...pane,
        activeFileId: newTabId,
        openFiles: [...pane.openFiles, newTabId],
        activeFileContent: '',
      };
    }

    set({ panes: newPanes, newTabCounter: newCounter });

    // Trigger rename mode in the app store
    useAppStore.getState().setRenamingFileId(newTabId, 'editor');
  },

  paneCloseOtherFiles: (paneId, fileId) => {
    const state = get();
    const pane = state.panes[paneId];
    if (!pane) return;

    const newPanes = { ...state.panes };
    const hasFile = pane.openFiles.includes(fileId);

    newPanes[paneId] = {
      ...pane,
      openFiles: hasFile ? [fileId] : [],
      activeFileId: hasFile ? fileId : null,
      activeFileContent:
        pane.activeFileId === fileId ? pane.activeFileContent : '',
    };
    set({ panes: newPanes });

    // Load content if switching to a different file
    if (hasFile && pane.activeFileId !== fileId) {
      get().paneSelectFile(paneId, fileId);
    }
  },

  paneCloseAllFiles: (paneId) => {
    const state = get();
    const pane = state.panes[paneId];
    if (!pane) return;

    const newPanes = { ...state.panes };
    newPanes[paneId] = {
      ...pane,
      openFiles: [],
      activeFileId: null,
      activeFileContent: '',
    };
    set({ panes: newPanes });
  },

  paneUpdateFileContent: (paneId, fileId, content) => {
    const state = get();
    const pane = state.panes[paneId];
    if (!pane) return;

    // Update pane content
    if (pane.activeFileId === fileId) {
      const newPanes = { ...state.panes };
      newPanes[paneId] = { ...pane, activeFileContent: content };
      set({ panes: newPanes });
    }

    // Delegate disk I/O and file tree updates to app store
    useAppStore.getState().updateFileContent(fileId, content);

    // If updateFileContent created a real file from a new-tab-*, sync the pane
    if (fileId.startsWith('new-tab-')) {
      // Wait a tick for the app store to update, then check for the new file ID
      setTimeout(() => {
        const appState = useAppStore.getState();
        const currentState = get();
        const currentPane = currentState.panes[paneId];
        if (!currentPane) return;

        // Check if the app store's file tree has a file that replaced this tab
        // The updateFileContent in useAppStore replaces the new-tab-* ID with a real path
        // We need to sync that change to the pane
        const newActiveId = appState.activeFileId;
        if (
          newActiveId &&
          newActiveId !== fileId &&
          currentPane.activeFileId === fileId
        ) {
          const newPanes = { ...currentState.panes };
          newPanes[paneId] = {
            ...currentPane,
            activeFileId: newActiveId,
            openFiles: currentPane.openFiles.map((id) =>
              id === fileId ? newActiveId : id
            ),
          };
          set({ panes: newPanes });
        }
      }, 50);
    }
  },

  toggleMaximizePane: (paneId) => {
    const { maximizedPaneId } = get();
    set({ maximizedPaneId: maximizedPaneId === paneId ? null : paneId });
  },

  // ─── Init/Reset ─────────────────────────────────────────────────────────

  resetToSinglePane: () => {
    const state = get();
    // Find the currently active pane to preserve it
    const activeId = state.activePaneId;
    const activePane = state.panes[activeId];

    set({
      rootNode: { type: 'leaf', paneId: activeId },
      panes: { [activeId]: activePane },
      maximizedPaneId: null,
    });
  },
}));

// Register with bridge for cross-store access
registerSplitStore(useSplitStore);

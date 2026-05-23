export interface RecentWorkspace {
  /** Absolute path to the workspace folder */
  path: string;
  /** Folder basename (display name) */
  name: string;
  /** Timestamp (Date.now()) of when this workspace was last opened */
  lastOpened: number;
}

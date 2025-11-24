// Types for the VSCode-style editor

export type ActivityBarView = 'explorer' | 'search' | 'git' | 'debug' | 'extensions';

export type ThemeMode = 'dark' | 'light';

export interface EditorTab {
  id: string;
  name: string;
  path: string;
  isDirty: boolean;
  language?: string;
}

export interface FileTreeNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: FileTreeNode[];
  isExpanded?: boolean;
  sha?: string;
  size?: number;
}

export interface TerminalInstance {
  id: string;
  title: string;
  shell: 'bash' | 'powershell' | 'cmd' | 'wsl';
}

export interface StatusBarInfo {
  lineNumber: number;
  columnNumber: number;
  language: string;
  encoding: string;
  eol: 'LF' | 'CRLF';
  gitBranch?: string;
  errors: number;
  warnings: number;
}

export interface ResizeState {
  isResizing: boolean;
  initialSize: number;
  initialMousePos: number;
}

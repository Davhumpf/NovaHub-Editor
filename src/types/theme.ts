// Theme types for the editor

export type ThemeMode = 'dark' | 'light' | 'custom';

export interface ThemeColors {
  // Background colors
  background: string;
  backgroundSecondary: string;
  backgroundTertiary: string;

  // Foreground colors
  foreground: string;
  foregroundSecondary: string;
  foregroundMuted: string;

  // Border colors
  border: string;
  borderLight: string;
  borderColor?: string;

  // Accent colors
  accent: string;
  accentHover: string;
  accentActive: string;

  // Status colors
  success: string;
  warning: string;
  error: string;
  info: string;

  // Activity bar
  activityBarBackground: string;
  activityBarForeground: string;
  activityBarBorder: string;
  activityBarActiveBackground: string;
  activityBarInactiveForeground: string;

  // Sidebar
  sidebarBackground: string;
  sidebarForeground: string;
  sidebarBorder: string;

  // Editor
  editorBackground: string;
  editorForeground: string;
  editorLineHighlight: string;
  editorSelection: string;

  // Title bar
  titleBarBackground: string;
  titleBarForeground: string;
  titleBarBorder: string;

  // Status bar
  statusBarBackground: string;
  statusBarForeground: string;
  statusBarBorder: string;

  // Terminal
  terminalBackground: string;
  terminalForeground: string;
  terminalBorder: string;

  // Tabs
  tabActiveBackground: string;
  tabActiveForeground: string;
  tabInactiveBackground: string;
  tabInactiveForeground: string;
  tabBorder: string;

  // Input
  inputBackground: string;
  inputForeground: string;
  inputBorder: string;
  inputPlaceholder: string;

  // Button
  buttonBackground: string;
  buttonForeground: string;
  buttonHoverBackground: string;

  // Dropdown
  dropdownBackground: string;
  dropdownForeground: string;
  dropdownBorder: string;

  // List
  listActiveBackground: string;
  listActiveForeground: string;
  listHoverBackground: string;
  listHoverForeground: string;
}

export interface Theme {
  id: string;
  name: string;
  type: ThemeMode;
  colors: ThemeColors;
  author?: string;
  version?: string;
  description?: string;
}

// Default Dark Theme (VS Code Dark+)
export const darkTheme: Theme = {
  id: 'dark',
  name: 'Nova Dark',
  type: 'dark',
  colors: {
    background: '#0c1118',
    backgroundSecondary: '#0f1724',
    backgroundTertiary: '#111c2b',

    foreground: '#e7f0ff',
    foregroundSecondary: '#c9d7ec',
    foregroundMuted: '#7b8a9f',

    border: '#1b2535',
    borderLight: '#223049',
    borderColor: '#1b2535',

    accent: '#34e39c',
    accentHover: '#46f0ad',
    accentActive: '#21c184',

    success: '#34e39c',
    warning: '#f2b545',
    error: '#ff7b7b',
    info: '#7cc7ff',

    activityBarBackground: '#0a1421',
    activityBarForeground: '#d3e5ff',
    activityBarBorder: '#162033',
    activityBarActiveBackground: '#132034',
    activityBarInactiveForeground: '#64748b',

    sidebarBackground: '#0e1624',
    sidebarForeground: '#dbe6f5',
    sidebarBorder: '#172338',

    editorBackground: '#0c121d',
    editorForeground: '#e7f0ff',
    editorLineHighlight: '#162134',
    editorSelection: '#1f7f5b80',

    titleBarBackground: '#0d1726',
    titleBarForeground: '#dbe6f5',
    titleBarBorder: '#1a2740',

    statusBarBackground: '#111d2d',
    statusBarForeground: '#dbe6f5',
    statusBarBorder: '#1a2740',

    terminalBackground: '#0b121d',
    terminalForeground: '#dbe6f5',
    terminalBorder: '#1a2740',

    tabActiveBackground: '#0f1624',
    tabActiveForeground: '#e7f0ff',
    tabInactiveBackground: '#111b2b',
    tabInactiveForeground: '#7b8a9f',
    tabBorder: '#1a2740',

    inputBackground: '#101a29',
    inputForeground: '#e7f0ff',
    inputBorder: '#1a2740',
    inputPlaceholder: '#6c7b91',

    buttonBackground: '#1f8a63',
    buttonForeground: '#e7f0ff',
    buttonHoverBackground: '#26a975',

    dropdownBackground: '#0f1724',
    dropdownForeground: '#dbe6f5',
    dropdownBorder: '#1a2740',

    listActiveBackground: '#1f7f5b40',
    listActiveForeground: '#e7f0ff',
    listHoverBackground: '#131f31',
    listHoverForeground: '#dbe6f5',
    background: '#1e1e1e',
    backgroundSecondary: '#252526',
    backgroundTertiary: '#2d2d2d',

    foreground: '#cccccc',
    foregroundSecondary: '#c5c5c5',
    foregroundMuted: '#858585',

    border: '#2d2d2d',
    borderLight: '#3c3c3c',
    borderColor: '#2d2d2d',

    accent: '#007acc',
    accentHover: '#1177bb',
    accentActive: '#0e639c',

    success: '#4ec9b0',
    warning: '#cca700',
    error: '#f48771',
    info: '#75beff',

    activityBarBackground: '#333333',
    activityBarForeground: '#ffffff',
    activityBarBorder: '#2d2d2d',
    activityBarActiveBackground: '#1e1e1e',
    activityBarInactiveForeground: '#858585',

    sidebarBackground: '#252526',
    sidebarForeground: '#cccccc',
    sidebarBorder: '#2d2d2d',

    editorBackground: '#1e1e1e',
    editorForeground: '#d4d4d4',
    editorLineHighlight: '#2a2a2a',
    editorSelection: '#264f78',

    titleBarBackground: '#323233',
    titleBarForeground: '#cccccc',
    titleBarBorder: '#2d2d2d',

    statusBarBackground: '#007acc',
    statusBarForeground: '#ffffff',
    statusBarBorder: '#007acc',

    terminalBackground: '#1e1e1e',
    terminalForeground: '#cccccc',
    terminalBorder: '#2d2d2d',

    tabActiveBackground: '#1e1e1e',
    tabActiveForeground: '#ffffff',
    tabInactiveBackground: '#2d2d2d',
    tabInactiveForeground: '#858585',
    tabBorder: '#252526',

    inputBackground: '#3c3c3c',
    inputForeground: '#cccccc',
    inputBorder: '#2d2d2d',
    inputPlaceholder: '#858585',

    buttonBackground: '#0e639c',
    buttonForeground: '#ffffff',
    buttonHoverBackground: '#1177bb',

    dropdownBackground: '#3c3c3c',
    dropdownForeground: '#cccccc',
    dropdownBorder: '#2d2d2d',

    listActiveBackground: '#094771',
    listActiveForeground: '#ffffff',
    listHoverBackground: '#2a2a2a',
    listHoverForeground: '#cccccc',
  },
};

// Default Light Theme (VS Code Light+)
export const lightTheme: Theme = {
  id: 'light',
  name: 'Nova Light',
  type: 'light',
  colors: {
    background: '#f7fafc',
    backgroundSecondary: '#eef2f6',
    backgroundTertiary: '#e3e9f2',

    foreground: '#0c1118',
    foregroundSecondary: '#1c2533',
    foregroundMuted: '#526079',

    border: '#d5dfec',
    borderLight: '#c7d4e6',
    borderColor: '#d5dfec',
    border: '#e5e5e5',
    borderLight: '#d0d0d0',
    borderColor: '#e5e5e5',

    accent: '#0fb981',
    accentHover: '#0dc78b',
    accentActive: '#0ba16f',

    success: '#0fb981',
    warning: '#d29b2c',
    error: '#e45b5b',
    info: '#0b7dd1',

    activityBarBackground: '#eef2f6',
    activityBarForeground: '#1c2533',
    activityBarBorder: '#d5dfec',
    activityBarActiveBackground: '#e3e9f2',
    activityBarInactiveForeground: '#7a869b',

    sidebarBackground: '#eef2f6',
    sidebarForeground: '#0c1118',
    sidebarBorder: '#d5dfec',

    editorBackground: '#ffffff',
    editorForeground: '#0c1118',
    editorLineHighlight: '#e8eef7',
    editorSelection: '#0fb98126',

    titleBarBackground: '#eef2f6',
    titleBarForeground: '#0c1118',
    titleBarBorder: '#d5dfec',

    statusBarBackground: '#0fb981',
    statusBarForeground: '#ffffff',
    statusBarBorder: '#0fb981',

    terminalBackground: '#ffffff',
    terminalForeground: '#0c1118',
    terminalBorder: '#d5dfec',

    tabActiveBackground: '#ffffff',
    tabActiveForeground: '#0c1118',
    tabInactiveBackground: '#e3e9f2',
    tabInactiveForeground: '#7a869b',
    tabBorder: '#d5dfec',

    inputBackground: '#ffffff',
    inputForeground: '#0c1118',
    inputBorder: '#d5dfec',
    inputPlaceholder: '#7a869b',

    buttonBackground: '#0fb981',
    buttonForeground: '#ffffff',
    buttonHoverBackground: '#0dc78b',

    dropdownBackground: '#ffffff',
    dropdownForeground: '#0c1118',
    dropdownBorder: '#d5dfec',

    listActiveBackground: '#0fb9811f',
    listActiveForeground: '#0c1118',
    listHoverBackground: '#e3e9f2',
    listHoverForeground: '#0c1118',
  },
};

// Predefined themes that can be installed via extensions
export const availableThemes: Theme[] = [
  darkTheme,
  lightTheme,
];

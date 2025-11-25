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
  name: 'Dark+',
  type: 'dark',
  colors: {
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
  name: 'Light+',
  type: 'light',
  colors: {
    background: '#ffffff',
    backgroundSecondary: '#f3f3f3',
    backgroundTertiary: '#e8e8e8',

    foreground: '#1e1e1e',
    foregroundSecondary: '#333333',
    foregroundMuted: '#6c6c6c',

    border: '#e5e5e5',
    borderLight: '#d0d0d0',
    borderColor: '#e5e5e5',

    accent: '#0066b8',
    accentHover: '#005a9e',
    accentActive: '#004578',

    success: '#14ce93',
    warning: '#f9a825',
    error: '#e51400',
    info: '#0066b8',

    activityBarBackground: '#f3f3f3',
    activityBarForeground: '#1e1e1e',
    activityBarBorder: '#e5e5e5',
    activityBarActiveBackground: '#ffffff',
    activityBarInactiveForeground: '#6c6c6c',

    sidebarBackground: '#f3f3f3',
    sidebarForeground: '#1e1e1e',
    sidebarBorder: '#e5e5e5',

    editorBackground: '#ffffff',
    editorForeground: '#1e1e1e',
    editorLineHighlight: '#f0f0f0',
    editorSelection: '#add6ff',

    titleBarBackground: '#f3f3f3',
    titleBarForeground: '#1e1e1e',
    titleBarBorder: '#e5e5e5',

    statusBarBackground: '#0066b8',
    statusBarForeground: '#ffffff',
    statusBarBorder: '#0066b8',

    terminalBackground: '#ffffff',
    terminalForeground: '#1e1e1e',
    terminalBorder: '#e5e5e5',

    tabActiveBackground: '#ffffff',
    tabActiveForeground: '#1e1e1e',
    tabInactiveBackground: '#e8e8e8',
    tabInactiveForeground: '#6c6c6c',
    tabBorder: '#f3f3f3',

    inputBackground: '#ffffff',
    inputForeground: '#1e1e1e',
    inputBorder: '#e5e5e5',
    inputPlaceholder: '#6c6c6c',

    buttonBackground: '#0066b8',
    buttonForeground: '#ffffff',
    buttonHoverBackground: '#005a9e',

    dropdownBackground: '#ffffff',
    dropdownForeground: '#1e1e1e',
    dropdownBorder: '#e5e5e5',

    listActiveBackground: '#0066b8',
    listActiveForeground: '#ffffff',
    listHoverBackground: '#e8e8e8',
    listHoverForeground: '#1e1e1e',
  },
};

// Predefined themes that can be installed via extensions
export const availableThemes: Theme[] = [
  darkTheme,
  lightTheme,
];

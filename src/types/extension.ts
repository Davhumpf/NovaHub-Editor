// Extension types for the extensions panel

export type ExtensionCategory = 'all' | 'formatters' | 'linters' | 'productivity' | 'git' | 'preview' | 'themes';

export interface Extension {
  id: string;
  name: string;
  description: string;
  category: ExtensionCategory[];
  icon: string;
  isPremium: boolean;
  isInstalled: boolean;
  isEnabled: boolean;
  version: string;
  author: string;
  downloads?: number;
  rating?: number;
  config?: ExtensionConfig;
}

export interface ExtensionConfig {
  [key: string]: any;
}

export interface ExtensionSetting {
  key: string;
  label: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'color';
  value: any;
  options?: { label: string; value: any }[];
  description?: string;
}

// Theme extension type
export interface ThemeExtension extends Extension {
  category: ['themes'];
  themeData: {
    id: string;
    name: string;
    colors: any;
  };
}

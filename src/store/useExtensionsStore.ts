import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Extension, ExtensionConfig } from '@/types/extension';

interface ExtensionsState {
  extensions: Extension[];
  installedExtensions: string[];
  enabledExtensions: string[];
  extensionConfigs: Record<string, ExtensionConfig>;

  // Actions
  installExtension: (extensionId: string) => void;
  uninstallExtension: (extensionId: string) => void;
  toggleExtension: (extensionId: string) => void;
  updateExtensionConfig: (extensionId: string, config: ExtensionConfig) => void;
  getExtension: (extensionId: string) => Extension | undefined;
  isExtensionEnabled: (extensionId: string) => boolean;
}

// Available extensions catalog
const defaultExtensions: Extension[] = [
  {
    id: 'prettier',
    name: 'Prettier',
    description: 'Code formatter for consistent style across your codebase',
    category: ['all', 'formatters'],
    icon: '💅',
    isPremium: false,
    isInstalled: false,
    isEnabled: false,
    version: '3.0.0',
    author: 'Prettier',
    downloads: 50000000,
    rating: 4.8,
  },
  {
    id: 'eslint',
    name: 'ESLint',
    description: 'Find and fix problems in your JavaScript code',
    category: ['all', 'linters'],
    icon: '🔍',
    isPremium: false,
    isInstalled: false,
    isEnabled: false,
    version: '8.45.0',
    author: 'Microsoft',
    downloads: 45000000,
    rating: 4.7,
  },
  {
    id: 'python-linter',
    name: 'Python Linter',
    description: 'Linting support for Python using Pylint',
    category: ['all', 'linters'],
    icon: '🐍',
    isPremium: false,
    isInstalled: false,
    isEnabled: false,
    version: '2.15.0',
    author: 'Microsoft',
    downloads: 25000000,
    rating: 4.6,
  },
  {
    id: 'emmet',
    name: 'Emmet',
    description: 'Essential toolkit for web developers with abbreviations',
    category: ['all', 'productivity'],
    icon: '⚡',
    isPremium: false,
    isInstalled: false,
    isEnabled: false,
    version: '2.4.0',
    author: 'Emmet',
    downloads: 30000000,
    rating: 4.9,
  },
  {
    id: 'gitlens',
    name: 'GitLens',
    description: 'Supercharge Git within VS Code with blame annotations and more',
    category: ['all', 'git'],
    icon: '🔎',
    isPremium: false,
    isInstalled: false,
    isEnabled: false,
    version: '14.0.0',
    author: 'GitKraken',
    downloads: 15000000,
    rating: 4.8,
  },
  {
    id: 'auto-close-tag',
    name: 'Auto Close Tag',
    description: 'Automatically add HTML/XML close tags',
    category: ['all', 'productivity'],
    icon: '🏷️',
    isPremium: false,
    isInstalled: false,
    isEnabled: false,
    version: '0.5.14',
    author: 'Jun Han',
    downloads: 20000000,
    rating: 4.7,
  },
  {
    id: 'bracket-colorizer',
    name: 'Bracket Pair Colorizer',
    description: 'Colorize matching brackets for easier code navigation',
    category: ['all', 'productivity'],
    icon: '🌈',
    isPremium: false,
    isInstalled: false,
    isEnabled: false,
    version: '2.0.0',
    author: 'CoenraadS',
    downloads: 12000000,
    rating: 4.6,
  },
  {
    id: 'path-intellisense',
    name: 'Path Intellisense',
    description: 'Autocomplete filenames in your code',
    category: ['all', 'productivity'],
    icon: '📁',
    isPremium: false,
    isInstalled: false,
    isEnabled: false,
    version: '2.8.0',
    author: 'Christian Kohler',
    downloads: 18000000,
    rating: 4.7,
  },
  {
    id: 'live-server',
    name: 'Live Server',
    description: 'Launch a development local server with live reload feature',
    category: ['all', 'preview'],
    icon: '🚀',
    isPremium: false,
    isInstalled: false,
    isEnabled: false,
    version: '5.7.0',
    author: 'Ritwick Dey',
    downloads: 25000000,
    rating: 4.8,
  },
  // Premium extensions
  {
    id: 'ai-copilot',
    name: 'AI Copilot',
    description: 'AI-powered code completion and suggestions',
    category: ['all', 'productivity'],
    icon: '🤖',
    isPremium: true,
    isInstalled: false,
    isEnabled: false,
    version: '1.0.0',
    author: 'NovaHub',
    downloads: 5000000,
    rating: 5.0,
  },
  {
    id: 'git-advanced',
    name: 'Git Advanced',
    description: 'Advanced Git features including interactive rebase, stash manager, and more',
    category: ['all', 'git'],
    icon: '🔧',
    isPremium: true,
    isInstalled: false,
    isEnabled: false,
    version: '1.5.0',
    author: 'NovaHub',
    downloads: 3000000,
    rating: 4.9,
  },
  {
    id: 'multi-device-preview',
    name: 'Multi-Device Preview',
    description: 'Preview your web apps on multiple devices simultaneously',
    category: ['all', 'preview'],
    icon: '📱',
    isPremium: true,
    isInstalled: false,
    isEnabled: false,
    version: '2.0.0',
    author: 'NovaHub',
    downloads: 2000000,
    rating: 4.8,
  },
  // Theme extensions
  {
    id: 'theme-dracula',
    name: 'Dracula Theme',
    description: 'Official Dracula dark theme',
    category: ['all', 'themes'],
    icon: '🧛',
    isPremium: false,
    isInstalled: false,
    isEnabled: false,
    version: '2.24.0',
    author: 'Dracula Theme',
    downloads: 8000000,
    rating: 4.9,
  },
  {
    id: 'theme-monokai',
    name: 'Monokai Pro',
    description: 'Beautiful functionality for professional developers',
    category: ['all', 'themes'],
    icon: '🎨',
    isPremium: false,
    isInstalled: false,
    isEnabled: false,
    version: '1.2.0',
    author: 'Monokai',
    downloads: 6000000,
    rating: 4.8,
  },
  {
    id: 'theme-night-owl',
    name: 'Night Owl',
    description: 'A VS Code theme for the night owls out there',
    category: ['all', 'themes'],
    icon: '🦉',
    isPremium: true,
    isInstalled: false,
    isEnabled: false,
    version: '2.0.1',
    author: 'Sarah Drasner',
    downloads: 4000000,
    rating: 4.9,
  },
];

export const useExtensionsStore = create<ExtensionsState>()(
  persist(
    (set, get) => ({
      extensions: defaultExtensions,
      installedExtensions: [],
      enabledExtensions: [],
      extensionConfigs: {},

      installExtension: (extensionId: string) => {
        const { installedExtensions, extensions } = get();
        if (!installedExtensions.includes(extensionId)) {
          set({
            installedExtensions: [...installedExtensions, extensionId],
            extensions: extensions.map(ext =>
              ext.id === extensionId ? { ...ext, isInstalled: true } : ext
            ),
          });
        }
      },

      uninstallExtension: (extensionId: string) => {
        const { installedExtensions, enabledExtensions, extensions } = get();
        set({
          installedExtensions: installedExtensions.filter(id => id !== extensionId),
          enabledExtensions: enabledExtensions.filter(id => id !== extensionId),
          extensions: extensions.map(ext =>
            ext.id === extensionId
              ? { ...ext, isInstalled: false, isEnabled: false }
              : ext
          ),
        });
      },

      toggleExtension: (extensionId: string) => {
        const { enabledExtensions, extensions } = get();
        const isCurrentlyEnabled = enabledExtensions.includes(extensionId);

        set({
          enabledExtensions: isCurrentlyEnabled
            ? enabledExtensions.filter(id => id !== extensionId)
            : [...enabledExtensions, extensionId],
          extensions: extensions.map(ext =>
            ext.id === extensionId
              ? { ...ext, isEnabled: !isCurrentlyEnabled }
              : ext
          ),
        });
      },

      updateExtensionConfig: (extensionId: string, config: ExtensionConfig) => {
        const { extensionConfigs } = get();
        set({
          extensionConfigs: {
            ...extensionConfigs,
            [extensionId]: config,
          },
        });
      },

      getExtension: (extensionId: string) => {
        const { extensions } = get();
        return extensions.find(ext => ext.id === extensionId);
      },

      isExtensionEnabled: (extensionId: string) => {
        const { enabledExtensions } = get();
        return enabledExtensions.includes(extensionId);
      },
    }),
    {
      name: 'novahub-extensions-storage',
    }
  )
);

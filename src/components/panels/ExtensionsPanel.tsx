"use client";
import React, { useState } from 'react';
import { VscSearch, VscCheck, VscClose } from 'react-icons/vsc';
import { useTheme } from '@/contexts/ThemeContext';

interface Extension {
  id: string;
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
  isPremium: boolean;
  category: 'formatter' | 'linter' | 'productivity' | 'git' | 'preview';
  version: string;
  author: string;
}

interface ExtensionsPanelProps {
  theme?: 'dark' | 'light';
}

const AVAILABLE_EXTENSIONS: Extension[] = [
  {
    id: 'prettier',
    name: 'Prettier',
    description: 'Formateador de código automático',
    icon: '✨',
    enabled: true,
    isPremium: false,
    category: 'formatter',
    version: '3.1.0',
    author: 'Prettier'
  },
  {
    id: 'eslint',
    name: 'ESLint',
    description: 'Linter para JavaScript/TypeScript',
    icon: '🔍',
    enabled: true,
    isPremium: false,
    category: 'linter',
    version: '8.54.0',
    author: 'ESLint'
  },
  {
    id: 'pylint',
    name: 'Python Linter',
    description: 'Análisis de código Python con PEP8',
    icon: '🐍',
    enabled: true,
    isPremium: false,
    category: 'linter',
    version: '2.17.0',
    author: 'Pylint'
  },
  {
    id: 'emmet',
    name: 'Emmet',
    description: 'Expansión rápida de HTML/CSS',
    icon: '⚡',
    enabled: true,
    isPremium: false,
    category: 'productivity',
    version: '2.4.0',
    author: 'Emmet'
  },
  {
    id: 'git-lens',
    name: 'Git Lens',
    description: 'Información de Git en el editor',
    icon: '🔎',
    enabled: false,
    isPremium: false,
    category: 'git',
    version: '1.0.0',
    author: 'Novahub'
  },
  {
    id: 'auto-close',
    name: 'Auto Close Tag',
    description: 'Cierra tags HTML automáticamente',
    icon: '🏷️',
    enabled: true,
    isPremium: false,
    category: 'productivity',
    version: '0.5.14',
    author: 'Jun Han'
  },
  {
    id: 'bracket-colorizer',
    name: 'Bracket Colorizer',
    description: 'Colorea llaves y paréntesis',
    icon: '🌈',
    enabled: true,
    isPremium: false,
    category: 'productivity',
    version: '2.0.0',
    author: 'CoenraadS'
  },
  {
    id: 'path-intellisense',
    name: 'Path Intellisense',
    description: 'Autocompletado de rutas',
    icon: '📂',
    enabled: true,
    isPremium: false,
    category: 'productivity',
    version: '2.8.5',
    author: 'Christian Kohler'
  },
  {
    id: 'live-server',
    name: 'Live Server',
    description: 'Preview en vivo con hot reload',
    icon: '🌐',
    enabled: true,
    isPremium: false,
    category: 'preview',
    version: '5.7.9',
    author: 'Ritwick Dey'
  },
  {
    id: 'ai-copilot',
    name: 'AI Copilot',
    description: 'Asistente de código con IA',
    icon: '🤖',
    enabled: false,
    isPremium: true,
    category: 'productivity',
    version: '1.0.0',
    author: 'Novahub Premium'
  },
];

export default function ExtensionsPanel({ theme: legacyTheme = 'dark' }: ExtensionsPanelProps) {
  const theme = useTheme();
  const [extensions, setExtensions] = useState(AVAILABLE_EXTENSIONS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', name: 'Todas' },
    { id: 'formatter', name: 'Formateadores' },
    { id: 'linter', name: 'Linters' },
    { id: 'productivity', name: 'Productividad' },
    { id: 'git', name: 'Git' },
    { id: 'preview', name: 'Preview' },
  ];

  const toggleExtension = (id: string) => {
    setExtensions(prev => prev.map(ext => 
      ext.id === id ? { ...ext, enabled: !ext.enabled } : ext
    ));
  };

  const filteredExtensions = extensions.filter(ext => {
    const matchesSearch = ext.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ext.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || ext.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col h-full" style={{ color: theme.colors.foreground }}>
      {/* Search */}
      <div className="p-3 border-b" style={{ borderColor: theme.colors.borderColor }}>
        <div className="relative">
          <VscSearch 
            className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4" 
            style={{ color: theme.colors.foregroundMuted }}
          />
          <input
            type="text"
            placeholder="Buscar extensiones..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-sm rounded border outline-none"
            style={{
              backgroundColor: theme.colors.backgroundTertiary,
              borderColor: theme.colors.borderColor,
              color: theme.colors.foreground
            }}
          />
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-1 px-3 py-2 border-b overflow-x-auto no-scrollbar" style={{ borderColor: theme.colors.borderColor }}>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className="px-3 py-1 text-xs rounded whitespace-nowrap transition-colors"
            style={{
              backgroundColor: selectedCategory === cat.id 
                ? theme.colors.accent 
                : theme.colors.backgroundTertiary,
              color: selectedCategory === cat.id 
                ? '#ffffff' 
                : theme.colors.foreground
            }}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Extensions List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 no-scrollbar">
        {filteredExtensions.map(ext => (
          <div
            key={ext.id}
            className="p-3 rounded border"
            style={{
              backgroundColor: theme.colors.backgroundSecondary,
              borderColor: theme.colors.borderColor
            }}
          >
            <div className="flex items-start gap-3">
              {/* Icon */}
              <span className="text-2xl flex-shrink-0">{ext.icon}</span>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-sm" style={{ color: theme.colors.foreground }}>
                    {ext.name}
                  </h3>
                  {ext.isPremium && (
                    <span 
                      className="px-2 py-0.5 text-xs rounded font-medium"
                      style={{ 
                        backgroundColor: '#7c3aed20',
                        color: '#a78bfa'
                      }}
                    >
                      PREMIUM
                    </span>
                  )}
                  {ext.enabled && (
                    <VscCheck className="w-4 h-4" style={{ color: '#10b981' }} />
                  )}
                </div>

                <p className="text-xs mb-2" style={{ color: theme.colors.foregroundMuted }}>
                  {ext.description}
                </p>

                <div className="flex items-center gap-3 text-xs" style={{ color: theme.colors.foregroundMuted }}>
                  <span>v{ext.version}</span>
                  <span>•</span>
                  <span>{ext.author}</span>
                </div>
              </div>

              {/* Toggle */}
              <button
                onClick={() => toggleExtension(ext.id)}
                className={`
                  relative w-10 h-6 rounded-full transition-colors flex-shrink-0
                  ${ext.enabled ? 'bg-blue-500' : 'bg-gray-600'}
                `}
                disabled={ext.isPremium}
                title={ext.isPremium ? 'Requiere Novahub Premium' : ''}
              >
                <div
                  className={`
                    absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform
                    ${ext.enabled ? 'translate-x-4' : 'translate-x-0.5'}
                  `}
                />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

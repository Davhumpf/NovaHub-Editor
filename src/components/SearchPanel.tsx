"use client";
import React, { useState } from 'react';
import { 
  VscSearch, 
  VscCaseSensitive, 
  VscWholeWord, 
  VscRegex,
  VscChevronRight,
  VscFile
} from 'react-icons/vsc';
import { useTheme } from '@/contexts/ThemeContext';

interface SearchPanelProps {
  theme?: 'dark' | 'light';
}

export default function SearchPanel({ theme: legacyTheme = 'dark' }: SearchPanelProps) {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [replaceQuery, setReplaceQuery] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);
  const [useRegex, setUseRegex] = useState(false);
  const [showReplace, setShowReplace] = useState(false);

  // Mock search results
  const searchResults = searchQuery ? [
    {
      file: 'src/components/Header.tsx',
      matches: [
        { line: 12, text: 'const Header = () => {', match: 'Header' },
        { line: 15, text: '  return <header className="header">', match: 'header' },
      ]
    },
    {
      file: 'src/app/page.tsx',
      matches: [
        { line: 8, text: 'import Header from "@/components/Header";', match: 'Header' },
        { line: 25, text: '      <Header />', match: 'Header' },
      ]
    }
  ] : [];

  return (
    <div className="flex flex-col h-full" style={{ color: theme.colors.foreground }}>
      {/* Search Input */}
      <div className="p-3 border-b space-y-2" style={{ borderColor: theme.colors.borderColor }}>
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-3 pr-20 py-2 text-sm rounded border outline-none"
            style={{
              backgroundColor: theme.colors.backgroundTertiary,
              borderColor: theme.colors.borderColor,
              color: theme.colors.foreground
            }}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
            <button
              onClick={() => setCaseSensitive(!caseSensitive)}
              className={`p-1 rounded ${caseSensitive ? 'bg-blue-500 text-white' : 'hover:bg-white/10'}`}
              title="Coincidir mayúsculas/minúsculas"
            >
              <VscCaseSensitive className="w-4 h-4" />
            </button>
            <button
              onClick={() => setWholeWord(!wholeWord)}
              className={`p-1 rounded ${wholeWord ? 'bg-blue-500 text-white' : 'hover:bg-white/10'}`}
              title="Palabra completa"
            >
              <VscWholeWord className="w-4 h-4" />
            </button>
            <button
              onClick={() => setUseRegex(!useRegex)}
              className={`p-1 rounded ${useRegex ? 'bg-blue-500 text-white' : 'hover:bg-white/10'}`}
              title="Usar expresión regular"
            >
              <VscRegex className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Replace Input */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowReplace(!showReplace)}
            className="p-1 rounded hover:bg-white/10"
          >
            <VscChevronRight 
              className={`w-4 h-4 transition-transform ${showReplace ? 'rotate-90' : ''}`} 
            />
          </button>
          <span className="text-xs" style={{ color: theme.colors.foregroundMuted }}>
            Reemplazar
          </span>
        </div>

        {showReplace && (
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Reemplazar..."
              value={replaceQuery}
              onChange={(e) => setReplaceQuery(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded border outline-none"
              style={{
                backgroundColor: theme.colors.backgroundTertiary,
                borderColor: theme.colors.borderColor,
                color: theme.colors.foreground
              }}
            />
            <div className="flex gap-2">
              <button
                className="px-3 py-1 text-xs rounded"
                style={{
                  backgroundColor: theme.colors.accent,
                  color: '#ffffff'
                }}
              >
                Reemplazar
              </button>
              <button
                className="px-3 py-1 text-xs rounded"
                style={{
                  backgroundColor: theme.colors.backgroundTertiary,
                  color: theme.colors.foreground
                }}
              >
                Reemplazar todo
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto">
        {searchQuery ? (
          searchResults.length > 0 ? (
            <div className="p-3 space-y-4">
              {searchResults.map((result, index) => (
                <div key={index}>
                  <div className="flex items-center gap-2 mb-2">
                    <VscFile className="w-4 h-4" style={{ color: theme.colors.foregroundMuted }} />
                    <span className="text-sm font-medium" style={{ color: theme.colors.foreground }}>
                      {result.file}
                    </span>
                    <span className="text-xs" style={{ color: theme.colors.foregroundMuted }}>
                      ({result.matches.length})
                    </span>
                  </div>
                  <div className="ml-6 space-y-1">
                    {result.matches.map((match, matchIndex) => (
                      <div
                        key={matchIndex}
                        className="p-2 rounded hover:bg-white/5 cursor-pointer"
                      >
                        <div className="flex items-center gap-2 text-xs">
                          <span 
                            className="font-mono"
                            style={{ color: theme.colors.foregroundMuted }}
                          >
                            {match.line}
                          </span>
                          <span style={{ color: theme.colors.foreground }}>
                            {match.text.split(match.match).map((part, i, arr) => (
                              <React.Fragment key={i}>
                                {part}
                                {i < arr.length - 1 && (
                                  <span 
                                    className="px-1 rounded"
                                    style={{ 
                                      backgroundColor: '#ff990050',
                                      color: '#ffcc00'
                                    }}
                                  >
                                    {match.match}
                                  </span>
                                )}
                              </React.Fragment>
                            ))}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full" style={{ color: theme.colors.foregroundMuted }}>
              <p className="text-sm">No se encontraron

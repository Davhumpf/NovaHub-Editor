'use client';

import React, { useState } from 'react';
import {
  VscSearch,
  VscCaseSensitive,
  VscWholeWord,
  VscRegex,
  VscChevronRight,
  VscChevronDown,
  VscFile,
} from 'react-icons/vsc';
import { useTheme } from '@/contexts/ThemeContext';
import { useEditorStore } from '@/store/useEditorStore';

interface SearchResult {
  file: string;
  line: number;
  column: number;
  text: string;
  match: string;
}

interface SearchPanelProps {
  theme?: 'dark' | 'light';
}

export default function SearchPanel({ theme: legacyTheme = 'dark' }: SearchPanelProps) {
  const { theme } = useTheme();
  const { repoFiles, fetchFileContent, currentRepo, openFile } = useEditorStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [replaceQuery, setReplaceQuery] = useState('');
  const [showReplace, setShowReplace] = useState(false);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);
  const [useRegex, setUseRegex] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set());

  const handleSearch = async () => {
    if (!searchQuery.trim() || !currentRepo) return;

    setIsSearching(true);
    const searchResults: SearchResult[] = [];

    try {
      // Search through all files
      for (const file of repoFiles) {
        const content = await fetchFileContent(
          currentRepo.owner.login,
          currentRepo.name,
          file.path
        );

        if (content) {
          const lines = content.content.split('\n');
          let regex: RegExp;

          try {
            if (useRegex) {
              regex = new RegExp(searchQuery, caseSensitive ? 'g' : 'gi');
            } else {
              const escapedQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
              const pattern = wholeWord ? `\\b${escapedQuery}\\b` : escapedQuery;
              regex = new RegExp(pattern, caseSensitive ? 'g' : 'gi');
            }

            lines.forEach((line, index) => {
              const matches = line.matchAll(regex);
              for (const match of matches) {
                searchResults.push({
                  file: file.path,
                  line: index + 1,
                  column: match.index || 0,
                  text: line.trim(),
                  match: match[0],
                });
              }
            });
          } catch (error) {
            console.error('Regex error:', error);
          }
        }
      }

      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const toggleFileExpanded = (file: string) => {
    const newExpanded = new Set(expandedFiles);
    if (newExpanded.has(file)) {
      newExpanded.delete(file);
    } else {
      newExpanded.add(file);
    }
    setExpandedFiles(newExpanded);
  };

  const handleResultClick = async (result: SearchResult) => {
    if (!currentRepo) return;

    const content = await fetchFileContent(
      currentRepo.owner.login,
      currentRepo.name,
      result.file
    );

    if (content) {
      openFile({
        id: `github-${currentRepo.name}-${result.file}`,
        name: result.file.split('/').pop() || result.file,
        path: result.file,
        content: content.content,
        language: 'plaintext',
        lastModified: new Date(),
      });
    }
  };

  // Group results by file
  const resultsByFile = results.reduce((acc, result) => {
    if (!acc[result.file]) {
      acc[result.file] = [];
    }
    acc[result.file].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Search Input */}
      <div className="p-3 border-b space-y-2" style={{ borderColor: theme.colors.border }}>
        <div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search"
            className="w-full px-3 py-2 rounded border focus:outline-none focus:ring-2 text-sm"
            style={{
              backgroundColor: theme.colors.inputBackground,
              color: theme.colors.inputForeground,
              borderColor: theme.colors.inputBorder,
            }}
          />
        </div>

        {showReplace && (
          <div>
            <input
              type="text"
              value={replaceQuery}
              onChange={(e) => setReplaceQuery(e.target.value)}
              placeholder="Replace"
              className="w-full px-3 py-2 rounded border focus:outline-none focus:ring-2 text-sm"
              style={{
                backgroundColor: theme.colors.inputBackground,
                color: theme.colors.inputForeground,
                borderColor: theme.colors.inputBorder,
              }}
            />
          </div>
        )}

        {/* Search Options */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCaseSensitive(!caseSensitive)}
            className="p-1.5 rounded transition-colors"
            style={{
              backgroundColor: caseSensitive
                ? theme.colors.buttonBackground
                : 'transparent',
              color: caseSensitive
                ? theme.colors.buttonForeground
                : theme.colors.foregroundMuted,
            }}
            title="Match Case"
          >
            <VscCaseSensitive className="w-4 h-4" />
          </button>

          <button
            onClick={() => setWholeWord(!wholeWord)}
            className="p-1.5 rounded transition-colors"
            style={{
              backgroundColor: wholeWord
                ? theme.colors.buttonBackground
                : 'transparent',
              color: wholeWord
                ? theme.colors.buttonForeground
                : theme.colors.foregroundMuted,
            }}
            title="Match Whole Word"
          >
            <VscWholeWord className="w-4 h-4" />
          </button>

          <button
            onClick={() => setUseRegex(!useRegex)}
            className="p-1.5 rounded transition-colors"
            style={{
              backgroundColor: useRegex
                ? theme.colors.buttonBackground
                : 'transparent',
              color: useRegex
                ? theme.colors.buttonForeground
                : theme.colors.foregroundMuted,
            }}
            title="Use Regular Expression"
          >
            <VscRegex className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowReplace(!showReplace)}
            className="ml-auto px-2 py-1 rounded text-xs transition-colors"
            style={{
              backgroundColor: theme.colors.backgroundTertiary,
              color: theme.colors.foregroundSecondary,
            }}
          >
            {showReplace ? 'Hide Replace' : 'Replace'}
          </button>
        </div>

        <button
          onClick={handleSearch}
          disabled={isSearching || !searchQuery.trim()}
          className="w-full px-3 py-2 rounded text-sm font-medium transition-colors disabled:opacity-50"
          style={{
            backgroundColor: theme.colors.buttonBackground,
            color: theme.colors.buttonForeground,
          }}
        >
          {isSearching ? 'Searching...' : 'Search'}
        </button>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto">
        {results.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center h-full p-8 text-center"
            style={{ color: theme.colors.foregroundMuted }}
          >
            <VscSearch className="w-12 h-12 mb-3 opacity-50" />
            <p className="text-sm">
              {searchQuery ? 'No results found' : 'Enter a search query to begin'}
            </p>
          </div>
        ) : (
          <div className="p-2">
            <div
              className="px-3 py-2 text-xs font-semibold"
              style={{ color: theme.colors.foregroundMuted }}
            >
              {results.length} result{results.length !== 1 ? 's' : ''} in{' '}
              {Object.keys(resultsByFile).length} file
              {Object.keys(resultsByFile).length !== 1 ? 's' : ''}
            </div>

            {Object.entries(resultsByFile).map(([file, fileResults]) => {
              const isExpanded = expandedFiles.has(file);
              return (
                <div key={file} className="mb-1">
                  <button
                    onClick={() => toggleFileExpanded(file)}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors text-left"
                    style={{
                      backgroundColor: isExpanded
                        ? theme.colors.listActiveBackground
                        : 'transparent',
                      color: isExpanded
                        ? theme.colors.listActiveForeground
                        : theme.colors.foreground,
                    }}
                    onMouseEnter={(e) => {
                      if (!isExpanded) {
                        e.currentTarget.style.backgroundColor =
                          theme.colors.listHoverBackground;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isExpanded) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    {isExpanded ? (
                      <VscChevronDown className="w-3 h-3 flex-shrink-0" />
                    ) : (
                      <VscChevronRight className="w-3 h-3 flex-shrink-0" />
                    )}
                    <VscFile className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{file}</span>
                    <span
                      className="ml-auto text-xs"
                      style={{ color: theme.colors.foregroundMuted }}
                    >
                      {fileResults.length}
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="ml-6 mt-1">
                      {fileResults.map((result, index) => (
                        <button
                          key={`${result.file}-${result.line}-${index}`}
                          onClick={() => handleResultClick(result)}
                          className="w-full flex items-start gap-2 px-2 py-1 rounded text-xs transition-colors text-left"
                          style={{ color: theme.colors.foregroundSecondary }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor =
                              theme.colors.listHoverBackground;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          <span
                            className="flex-shrink-0 font-mono"
                            style={{ color: theme.colors.foregroundMuted }}
                          >
                            {result.line}:{result.column}
                          </span>
                          <span className="truncate">{result.text}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import {
  VscDebugStart,
  VscDebugPause,
  VscDebugStop,
  VscDebugRestart,
  VscDebugStepOver,
  VscDebugStepInto,
  VscDebugStepOut,
  VscChevronRight,
  VscChevronDown,
} from 'react-icons/vsc';
import { useTheme } from '@/contexts/ThemeContext';

interface Variable {
  name: string;
  value: string;
  type: string;
}

interface DebugPanelProps {
  theme?: 'dark' | 'light';
}

export default function DebugPanel({ theme: legacyTheme = 'dark' }: DebugPanelProps) {
  const { theme } = useTheme();

  const [isDebugging, setIsDebugging] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [expandedVariables, setExpandedVariables] = useState<Set<string>>(new Set());

  // Mock variables
  const [variables] = useState<Variable[]>([
    { name: 'user', value: '{id: 1, name: "John"}', type: 'object' },
    { name: 'count', value: '42', type: 'number' },
    { name: 'isActive', value: 'true', type: 'boolean' },
    { name: 'message', value: '"Hello World"', type: 'string' },
  ]);

  const handleStart = () => {
    setIsDebugging(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    setIsPaused(true);
  };

  const handleStop = () => {
    setIsDebugging(false);
    setIsPaused(false);
  };

  const handleRestart = () => {
    setIsDebugging(true);
    setIsPaused(false);
  };

  const toggleVariable = (name: string) => {
    const newExpanded = new Set(expandedVariables);
    if (newExpanded.has(name)) {
      newExpanded.delete(name);
    } else {
      newExpanded.add(name);
    }
    setExpandedVariables(newExpanded);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Debug Controls */}
      <div className="p-3 border-b" style={{ borderColor: theme.colors.border }}>
        <div className="flex items-center gap-1 mb-3">
          {!isDebugging ? (
            <button
              onClick={handleStart}
              className="p-2 rounded transition-colors"
              style={{
                backgroundColor: theme.colors.success,
                color: '#ffffff',
              }}
              title="Start Debugging (F5)"
            >
              <VscDebugStart className="w-5 h-5" />
            </button>
          ) : (
            <>
              {!isPaused ? (
                <button
                  onClick={handlePause}
                  className="p-2 rounded transition-colors"
                  style={{
                    backgroundColor: theme.colors.warning,
                    color: '#ffffff',
                  }}
                  title="Pause (F6)"
                >
                  <VscDebugPause className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={handleStart}
                  className="p-2 rounded transition-colors"
                  style={{
                    backgroundColor: theme.colors.success,
                    color: '#ffffff',
                  }}
                  title="Continue (F5)"
                >
                  <VscDebugStart className="w-5 h-5" />
                </button>
              )}

              <button
                onClick={handleStop}
                className="p-2 rounded transition-colors"
                style={{
                  backgroundColor: theme.colors.error,
                  color: '#ffffff',
                }}
                title="Stop (Shift+F5)"
              >
                <VscDebugStop className="w-5 h-5" />
              </button>

              <button
                onClick={handleRestart}
                className="p-2 rounded transition-colors"
                style={{
                  backgroundColor: theme.colors.backgroundTertiary,
                  color: theme.colors.foreground,
                }}
                title="Restart (Ctrl+Shift+F5)"
              >
                <VscDebugRestart className="w-5 h-5" />
              </button>

              <div
                className="w-px h-6 mx-1"
                style={{ backgroundColor: theme.colors.border }}
              />

              <button
                onClick={() => {}}
                disabled={!isPaused}
                className="p-2 rounded transition-colors disabled:opacity-50"
                style={{
                  backgroundColor: theme.colors.backgroundTertiary,
                  color: theme.colors.foreground,
                }}
                title="Step Over (F10)"
              >
                <VscDebugStepOver className="w-5 h-5" />
              </button>

              <button
                onClick={() => {}}
                disabled={!isPaused}
                className="p-2 rounded transition-colors disabled:opacity-50"
                style={{
                  backgroundColor: theme.colors.backgroundTertiary,
                  color: theme.colors.foreground,
                }}
                title="Step Into (F11)"
              >
                <VscDebugStepInto className="w-5 h-5" />
              </button>

              <button
                onClick={() => {}}
                disabled={!isPaused}
                className="p-2 rounded transition-colors disabled:opacity-50"
                style={{
                  backgroundColor: theme.colors.backgroundTertiary,
                  color: theme.colors.foreground,
                }}
                title="Step Out (Shift+F11)"
              >
                <VscDebugStepOut className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        {isDebugging && (
          <div
            className="px-3 py-2 rounded text-xs font-mono"
            style={{
              backgroundColor: isPaused ? theme.colors.warning + '20' : theme.colors.success + '20',
              color: isPaused ? theme.colors.warning : theme.colors.success,
              border: `1px solid ${isPaused ? theme.colors.warning : theme.colors.success}`,
            }}
          >
            {isPaused ? '⏸ Paused on line 42' : '▶ Running...'}
          </div>
        )}
      </div>

      {/* Variables View */}
      {isDebugging ? (
        <div className="flex-1 overflow-y-auto">
          <div className="p-2">
            <div
              className="px-3 py-2 text-xs font-semibold uppercase tracking-wide"
              style={{ color: theme.colors.foregroundMuted }}
            >
              Variables
            </div>

            <div className="space-y-0.5">
              {variables.map((variable) => {
                const isExpanded = expandedVariables.has(variable.name);
                return (
                  <div key={variable.name}>
                    <button
                      onClick={() => toggleVariable(variable.name)}
                      className="w-full flex items-center gap-2 px-3 py-1.5 rounded transition-colors text-left"
                      style={{ color: theme.colors.foreground }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor =
                          theme.colors.listHoverBackground;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      {variable.type === 'object' ? (
                        isExpanded ? (
                          <VscChevronDown className="w-3 h-3 flex-shrink-0" />
                        ) : (
                          <VscChevronRight className="w-3 h-3 flex-shrink-0" />
                        )
                      ) : (
                        <span className="w-3" />
                      )}
                      <span className="text-sm font-mono">{variable.name}</span>
                      <span
                        className="text-xs font-mono ml-auto"
                        style={{ color: theme.colors.foregroundMuted }}
                      >
                        {variable.type}
                      </span>
                    </button>

                    {isExpanded && variable.type === 'object' && (
                      <div
                        className="ml-8 p-2 rounded text-xs font-mono"
                        style={{
                          backgroundColor: theme.colors.backgroundTertiary,
                          color: theme.colors.foregroundSecondary,
                        }}
                      >
                        {variable.value}
                      </div>
                    )}

                    {!isExpanded && variable.type !== 'object' && (
                      <div
                        className="ml-5 px-3 py-1 text-xs font-mono"
                        style={{ color: theme.colors.info }}
                      >
                        {variable.value}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Call Stack */}
          <div className="p-2 border-t" style={{ borderColor: theme.colors.border }}>
            <div
              className="px-3 py-2 text-xs font-semibold uppercase tracking-wide"
              style={{ color: theme.colors.foregroundMuted }}
            >
              Call Stack
            </div>

            <div className="space-y-0.5">
              <div
                className="px-3 py-1.5 rounded text-sm"
                style={{
                  backgroundColor: theme.colors.listActiveBackground,
                  color: theme.colors.listActiveForeground,
                }}
              >
                main <span className="text-xs opacity-70">src/index.ts:42</span>
              </div>
              <div
                className="px-3 py-1.5 text-sm"
                style={{ color: theme.colors.foregroundSecondary }}
              >
                handleClick <span className="text-xs opacity-70">src/App.tsx:128</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div
          className="flex flex-col items-center justify-center h-full p-8 text-center"
          style={{ color: theme.colors.foregroundMuted }}
        >
          <VscDebugStart className="w-12 h-12 mb-3 opacity-50" />
          <p className="text-sm mb-2">No active debug session</p>
          <p className="text-xs">Press F5 or click the start button to begin debugging</p>
        </div>
      )}
    </div>
  );
}

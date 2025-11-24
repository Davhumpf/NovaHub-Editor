'use client';

import React, { useState } from 'react';
import { VscAccount, VscColorMode, VscSignOut } from 'react-icons/vsc';
import { useEditorStore } from '@/store/useEditorStore';
import { useUserStore } from '@/store/useUserStore';
import { useTheme } from '@/contexts/ThemeContext';
import { useResizable } from '@/hooks/useResizable';
import { useKeyBindings } from '@/hooks/useKeyBindings';
import { ActivityBarView, StatusBarInfo, EditorTab } from '@/types/editor';
import ActivityBar from './ActivityBar';
import Sidebar from './Sidebar';
import EditorTabs from './EditorTabs';
import MonacoEditor from './MonacoEditor';
import Terminal from './Terminal';
import StatusBar from './StatusBar';
import ResizeHandle from './ResizeHandle';
import AuthModal from '../auth/AuthModal';

export default function EditorLayoutNew() {
  const { theme, themeMode, setThemeMode } = useTheme();
  const { user, isAuthenticated, logout } = useUserStore();

  // Convert ThemeMode to legacy theme for components that don't support custom themes yet
  const legacyTheme: 'dark' | 'light' = themeMode === 'light' ? 'light' : 'dark';

  const {
    openFiles,
    activeFileId,
    setActiveFile,
    closeFile,
    updateFileContent,
    currentRepo,
  } = useEditorStore();

  const [activeView, setActiveView] = useState<ActivityBarView>('explorer');
  const [showTerminal, setShowTerminal] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  // Sidebar resizing
  const sidebarResize = useResizable({
    initialSize: 300,
    minSize: 200,
    maxSize: 600,
    direction: 'horizontal',
  });

  // Terminal resizing
  const terminalResize = useResizable({
    initialSize: 300,
    minSize: 100,
    maxSize: 600,
    direction: 'vertical',
  });

  // Get active file
  const activeFile = openFiles.find((f) => f.id === activeFileId);

  // Convert openFiles to EditorTab format
  const editorTabs: EditorTab[] = openFiles.map((file) => ({
    id: file.id,
    name: file.name,
    path: file.path,
    isDirty: false,
    language: file.language,
  }));

  // Status bar info
  const statusBarInfo: StatusBarInfo = {
    lineNumber: cursorPosition.line,
    columnNumber: cursorPosition.column,
    language: activeFile?.language || 'plaintext',
    encoding: 'UTF-8',
    eol: 'LF',
    gitBranch: currentRepo?.default_branch,
    errors: 0,
    warnings: 0,
  };

  // Key bindings
  useKeyBindings([
    {
      key: 'e',
      ctrl: true,
      shift: true,
      callback: () => setActiveView('explorer'),
    },
    {
      key: 'f',
      ctrl: true,
      shift: true,
      callback: () => setActiveView('search'),
    },
    {
      key: 'g',
      ctrl: true,
      shift: true,
      callback: () => setActiveView('git'),
    },
    {
      key: 'd',
      ctrl: true,
      shift: true,
      callback: () => setActiveView('debug'),
    },
    {
      key: 'x',
      ctrl: true,
      shift: true,
      callback: () => setActiveView('extensions'),
    },
    {
      key: '`',
      ctrl: true,
      callback: () => setShowTerminal(!showTerminal),
    },
    {
      key: 'w',
      ctrl: true,
      callback: () => {
        if (activeFileId) {
          closeFile(activeFileId);
        }
      },
    },
  ]);

  const handleEditorChange = (value: string | undefined) => {
    if (activeFileId && value !== undefined) {
      updateFileContent(activeFileId, value);
    }
  };

  const handleCursorPositionChange = (line: number, column: number) => {
    setCursorPosition({ line, column });
  };

  const toggleTheme = () => {
    const newMode = themeMode === 'dark' ? 'light' : 'dark';
    setThemeMode(newMode);
  };

  return (
    <div
      className="flex flex-col h-screen"
      style={{ backgroundColor: theme.colors.background }}
    >
      {/* Title Bar */}
      <div
        className="flex items-center justify-between h-[35px] px-4 border-b"
        style={{
          backgroundColor: theme.colors.titleBarBackground,
          borderColor: theme.colors.titleBarBorder,
        }}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="NovaHub Logo"
              className="h-5 w-5 rounded"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <span
              className="text-sm font-medium"
              style={{ color: theme.colors.titleBarForeground }}
            >
              NovaHub Editor
            </span>
          </div>
          {activeFile && (
            <>
              <span style={{ color: theme.colors.foregroundMuted }}>—</span>
              <span
                className="text-sm"
                style={{ color: theme.colors.titleBarForeground }}
              >
                {activeFile.name}
              </span>
            </>
          )}
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded transition-opacity hover:opacity-70"
            style={{ color: theme.colors.titleBarForeground }}
            title={`Switch to ${themeMode === 'dark' ? 'light' : 'dark'} theme`}
          >
            <VscColorMode className="w-4 h-4" />
          </button>

          {/* User Menu */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2">
              <div
                className="flex items-center gap-2 px-2 py-1 rounded"
                style={{
                  backgroundColor: user.tier === 'premium' ? '#7c3aed20' : theme.colors.backgroundTertiary,
                  border: user.tier === 'premium' ? '1px solid #7c3aed' : 'none',
                }}
              >
                <VscAccount
                  className="w-4 h-4"
                  style={{ color: user.tier === 'premium' ? '#a78bfa' : theme.colors.titleBarForeground }}
                />
                <span
                  className="text-xs font-medium"
                  style={{ color: user.tier === 'premium' ? '#a78bfa' : theme.colors.titleBarForeground }}
                >
                  {user.name}
                  {user.tier === 'premium' && ' ✨'}
                </span>
              </div>
              <button
                onClick={logout}
                className="p-1.5 rounded transition-opacity hover:opacity-70"
                style={{ color: theme.colors.titleBarForeground }}
                title="Sign out"
              >
                <VscSignOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="px-3 py-1 rounded text-xs font-medium transition-colors"
              style={{
                backgroundColor: theme.colors.buttonBackground,
                color: theme.colors.buttonForeground,
              }}
            >
              Sign In
            </button>
          )}

          {/* Window controls */}
          <div className="flex items-center gap-1 ml-2">
            <button
              className="w-3 h-3 rounded-full transition-opacity hover:opacity-70"
              style={{ backgroundColor: theme.colors.foregroundMuted }}
              title="Minimize"
            />
            <button
              className="w-3 h-3 rounded-full transition-opacity hover:opacity-70"
              style={{ backgroundColor: theme.colors.foregroundMuted }}
              title="Maximize"
            />
            <button
              className="w-3 h-3 rounded-full transition-colors hover:bg-red-500"
              style={{ backgroundColor: theme.colors.foregroundMuted }}
              title="Close"
            />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Activity Bar */}
        <ActivityBar
          activeView={activeView}
          onViewChange={setActiveView}
          theme={legacyTheme}
        />

        {/* Sidebar */}
        <Sidebar
          activeView={activeView}
          theme={legacyTheme}
          size={sidebarResize.size}
          isResizing={sidebarResize.isResizing}
          onMouseDown={sidebarResize.handleMouseDown}
        />

        {/* Editor Area */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Editor Tabs */}
          <EditorTabs
            tabs={editorTabs}
            activeTabId={activeFileId}
            onTabClick={setActiveFile}
            onTabClose={closeFile}
            theme={legacyTheme}
          />

          {/* Editor or Welcome Screen */}
          <div className="flex-1 overflow-hidden relative">
            {activeFile ? (
              <MonacoEditor
                value={activeFile.content}
                language={activeFile.language}
                theme={legacyTheme}
                onChange={handleEditorChange}
                onCursorPositionChange={handleCursorPositionChange}
              />
            ) : (
              <div
                className="flex flex-col items-center justify-center h-full"
                style={{ color: theme.colors.foregroundMuted }}
              >
                <h1
                  className="text-4xl font-light mb-4"
                  style={{ color: theme.colors.foreground }}
                >
                  NovaHub Editor
                </h1>
                <p className="text-sm mb-8">Professional web-based code editor</p>
                <div className="flex flex-col gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <kbd
                      className="px-2 py-1 rounded text-xs"
                      style={{ backgroundColor: theme.colors.backgroundTertiary }}
                    >
                      Ctrl+Shift+E
                    </kbd>
                    <span>Toggle Explorer</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd
                      className="px-2 py-1 rounded text-xs"
                      style={{ backgroundColor: theme.colors.backgroundTertiary }}
                    >
                      Ctrl+Shift+X
                    </kbd>
                    <span>Toggle Extensions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd
                      className="px-2 py-1 rounded text-xs"
                      style={{ backgroundColor: theme.colors.backgroundTertiary }}
                    >
                      Ctrl+`
                    </kbd>
                    <span>Toggle Terminal</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Terminal Panel */}
          {showTerminal && (
            <>
              <ResizeHandle
                direction="vertical"
                onMouseDown={terminalResize.handleMouseDown}
                isResizing={terminalResize.isResizing}
              />
              <div style={{ height: `${terminalResize.size}px` }}>
                <Terminal
                  theme={legacyTheme}
                  isVisible={showTerminal}
                  onClose={() => setShowTerminal(false)}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <StatusBar info={statusBarInfo} theme={legacyTheme} />

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
}

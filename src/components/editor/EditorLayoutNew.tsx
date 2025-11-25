'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
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
import GitHubConnect from '../GitHubConnect';
import { GitHubRepo } from '@/store/useEditorStore';
import ProjectWizard from '../ProjectWizard';

export default function EditorLayoutNew() {
  const { theme, themeMode, setThemeMode } = useTheme();
  const { data: session } = useSession();
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
    fetchRepoTree,
    terminalVisible,
    setTerminalVisible,
  } = useEditorStore();

  const [activeView, setActiveView] = useState<ActivityBarView>('explorer');
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showGitHubConnect, setShowGitHubConnect] = useState(false);
  const [showProjectWizard, setShowProjectWizard] = useState(false);

  const handleProjectCreated = useCallback((projectPath: string) => {
    console.info('Proyecto creado en', projectPath);
    setShowProjectWizard(false);
    setActiveView('explorer');
  }, [setActiveView]);

  // Sidebar resizing
  const sidebarResize = useResizable({
    initialSize: 300,
    minSize: 200,
    maxSize: 600,
    direction: 'horizontal',
  });

  // Terminal resizing
  const terminalResize = useResizable({
    initialSize: 200,
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
    isDirty: file.isDirty,
    language: file.language,
  }));

  // Status bar info
  const statusBarInfo: StatusBarInfo = {
    lineNumber: cursorPosition.line,
    columnNumber: cursorPosition.column,
    language: activeFile?.language || 'plaintext',
    encoding: 'UTF-8',
    eol: 'LF',
    indentation: 'Spaces: 2',
    gitBranch: currentRepo?.default_branch,
    errors: 0,
    warnings: 0,
  };

  const toggleTerminal = useCallback(() => {
    setTerminalVisible(!terminalVisible);
  }, [setTerminalVisible, terminalVisible]);

  const keyBindings = useMemo(
    () => [
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
        callback: () => toggleTerminal(),
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
    ],
    [activeFileId, closeFile, setActiveView, toggleTerminal]
  );

  // Key bindings
  useKeyBindings(keyBindings);

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

  const handleRepoChange = useCallback(
    (repo?: GitHubRepo) => {
      const targetRepo = repo ?? currentRepo;
      if (!targetRepo) return;

      fetchRepoTree(
        targetRepo.owner.login,
        targetRepo.name,
        targetRepo.default_branch
      );
      setActiveView('explorer');
    },
    [currentRepo, fetchRepoTree]
  );

  useEffect(() => {
    if (currentRepo) {
      handleRepoChange();
    }
  }, [currentRepo, fetchRepoTree, handleRepoChange]);

  return (
    <div
      className="relative flex flex-col h-screen overflow-hidden"
      style={{
        background: `linear-gradient(145deg, ${theme.colors.background} 0%, ${theme.colors.backgroundSecondary} 50%, ${theme.colors.background} 100%)`,
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{ backgroundImage: 'var(--theme-glow)' }}
      />

      <div className="relative flex flex-col h-full">
        {/* Title Bar */}
        <div
          className="flex items-center justify-between px-5 py-3 border-b backdrop-blur-xl"
          style={{
            backgroundColor: `${theme.colors.titleBarBackground}dd`,
            borderColor: theme.colors.titleBarBorder,
            boxShadow: '0 12px 40px rgba(0,0,0,0.35)',
          }}
        >
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 rounded-full px-3 py-2 transition hover:opacity-90"
              style={{
                backgroundColor: `${theme.colors.backgroundTertiary}80`,
                border: `1px solid ${theme.colors.border}`,
                color: theme.colors.titleBarForeground,
              }}
            >
              <img
                src="/logo.png"
                alt="NovaHub Logo"
                className="h-5 w-5 rounded"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-semibold">NovaHub Editor</span>
                <span className="text-[11px]" style={{ color: theme.colors.foregroundMuted }}>
                  Regresar al inicio
                </span>
              </div>
            </Link>
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
            {/* GitHub connection */}
            <button
              onClick={() => setShowGitHubConnect(true)}
              className="px-3 py-2 rounded-xl text-xs font-semibold transition-all shadow-[0_10px_40px_rgba(0,0,0,0.35)]"
              style={{
                background: currentRepo
                  ? `linear-gradient(120deg, ${theme.colors.accent} 0%, ${theme.colors.accentHover} 100%)`
                  : `${theme.colors.backgroundTertiary}b3`,
                color: currentRepo ? '#031410' : theme.colors.titleBarForeground,
                border: `1px solid ${theme.colors.border}`,
              }}
            >
              {currentRepo ? (
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: '#7CFFB2' }} />
                  {currentRepo.owner.login}/{currentRepo.name}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: theme.colors.accent }} />
                  {session ? 'Seleccionar repositorio' : 'Conectar GitHub'}
                </span>
              )}
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl transition-all hover:opacity-80"
              style={{
                color: theme.colors.titleBarForeground,
                backgroundColor: `${theme.colors.backgroundTertiary}80`,
                border: `1px solid ${theme.colors.border}`,
              }}
              title={`Cambiar a tema ${themeMode === 'dark' ? 'claro' : 'oscuro'}`}
            >
              <VscColorMode className="w-4 h-4" />
            </button>

            {/* User Menu */}
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2">
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-xl"
                  style={{
                    backgroundColor: `${theme.colors.backgroundTertiary}b3`,
                    border: `1px solid ${theme.colors.border}`,
                  }}
                >
                  <VscAccount
                    className="w-4 h-4"
                    style={{ color: theme.colors.titleBarForeground }}
                  />
                  <div className="leading-tight">
                    <span
                      className="text-xs font-semibold block"
                      style={{ color: theme.colors.titleBarForeground }}
                    >
                      {user.name}
                    </span>
                    <span className="text-[11px]" style={{ color: theme.colors.foregroundMuted }}>
                      {user.tier === 'premium' ? 'Premium' : 'Cuenta gratuita'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="p-2 rounded-xl transition-opacity hover:opacity-80"
                  style={{
                    color: theme.colors.titleBarForeground,
                    backgroundColor: `${theme.colors.backgroundTertiary}80`,
                    border: `1px solid ${theme.colors.border}`,
                  }}
                  title="Cerrar sesión"
                >
                  <VscSignOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                style={{
                  backgroundColor: `${theme.colors.backgroundTertiary}80`,
                  color: theme.colors.titleBarForeground,
                  border: `1px solid ${theme.colors.border}`,
                }}
              >
                Guardar perfil (free)
              </button>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-4">
          <div
            className="flex h-full overflow-hidden rounded-2xl border backdrop-blur-xl shadow-[0_25px_70px_rgba(0,0,0,0.35)]"
            style={{
              borderColor: theme.colors.border,
              backgroundColor: `${theme.colors.backgroundSecondary}cc`,
            }}
          >
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
              onCreateProject={() => setShowProjectWizard(true)}
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
              {terminalVisible && (
                <>
                  <ResizeHandle
                    direction="vertical"
                    onMouseDown={terminalResize.handleMouseDown}
                    isResizing={terminalResize.isResizing}
                  />
                  <div style={{ height: `${terminalResize.size}px` }}>
                    <Terminal
                      theme={legacyTheme}
                      isVisible={terminalVisible}
                      onClose={() => setTerminalVisible(false)}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Status Bar fijo inferior */}
        <StatusBar
          info={statusBarInfo}
          terminalVisible={terminalVisible}
          onToggleTerminal={toggleTerminal}
        />

      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      <ProjectWizard
        isOpen={showProjectWizard}
        onClose={() => setShowProjectWizard(false)}
        onProjectCreated={handleProjectCreated}
      />

      {/* GitHub connection modal remains available for free users */}
      {showGitHubConnect && (
        <GitHubConnect
          onClose={() => setShowGitHubConnect(false)}
          onRepoSelected={handleRepoChange}
        />
      )}
    </div>
  );
}

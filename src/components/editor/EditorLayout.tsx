'use client';

import React, { useState, useEffect } from 'react';
import { VscClose } from 'react-icons/vsc';
import { useEditorStore } from '@/store/useEditorStore';
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

interface EditorLayoutProps {
  theme?: 'dark' | 'light';
}

export default function EditorLayout({ theme = 'dark' }: EditorLayoutProps) {
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

  return (
    <div
      className={`
        flex flex-col h-screen
        ${theme === 'dark' ? 'bg-[#1e1e1e]' : 'bg-white'}
      `}
    >
      {/* Title Bar */}
      <div
        className={`
          flex items-center justify-between h-[35px] px-4
          ${theme === 'dark' ? 'bg-[#323233]' : 'bg-[#f3f3f3]'}
          border-b
          ${theme === 'dark' ? 'border-[#2d2d2d]' : 'border-[#e5e5e5]'}
        `}
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
              className={`
                text-sm font-medium
                ${theme === 'dark' ? 'text-[#cccccc]' : 'text-[#1e1e1e]'}
              `}
            >
              NovaHub Editor
            </span>
          </div>
          {activeFile && (
            <>
              <span
                className={`
                  text-sm
                  ${theme === 'dark' ? 'text-[#858585]' : 'text-[#6c6c6c]'}
                `}
              >
                —
              </span>
              <span
                className={`
                  text-sm
                  ${theme === 'dark' ? 'text-[#cccccc]' : 'text-[#1e1e1e]'}
                `}
              >
                {activeFile.name}
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Window controls (placeholder) */}
          <div className="flex items-center gap-1">
            <button
              className={`
                w-3 h-3 rounded-full
                ${theme === 'dark' ? 'bg-[#5a5a5a] hover:bg-[#6a6a6a]' : 'bg-[#d0d0d0] hover:bg-[#c0c0c0]'}
              `}
              title="Minimize"
            />
            <button
              className={`
                w-3 h-3 rounded-full
                ${theme === 'dark' ? 'bg-[#5a5a5a] hover:bg-[#6a6a6a]' : 'bg-[#d0d0d0] hover:bg-[#c0c0c0]'}
              `}
              title="Maximize"
            />
            <button
              className={`
                w-3 h-3 rounded-full
                ${theme === 'dark' ? 'bg-[#5a5a5a] hover:bg-red-500' : 'bg-[#d0d0d0] hover:bg-red-500'}
              `}
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
          theme={theme}
        />

        {/* Sidebar */}
        <Sidebar
          activeView={activeView}
          theme={theme}
          size={sidebarResize.size}
          isResizing={sidebarResize.isResizing}
          onMouseDown={sidebarResize.handleMouseDown}
          onCreateProject={() => {}}
        />

        {/* Editor Area */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Editor Tabs */}
          <EditorTabs
            tabs={editorTabs}
            activeTabId={activeFileId}
            onTabClick={setActiveFile}
            onTabClose={closeFile}
            theme={theme}
          />

          {/* Editor or Welcome Screen */}
          <div className="flex-1 overflow-hidden relative">
            {activeFile ? (
              <MonacoEditor
                value={activeFile.content}
                language={activeFile.language}
                theme={theme}
                onChange={handleEditorChange}
                onCursorPositionChange={handleCursorPositionChange}
              />
            ) : (
              <div
                className={`
                  flex flex-col items-center justify-center h-full
                  ${theme === 'dark' ? 'text-[#858585]' : 'text-[#6c6c6c]'}
                `}
              >
                <h1
                  className={`
                    text-4xl font-light mb-4
                    ${theme === 'dark' ? 'text-[#cccccc]' : 'text-[#1e1e1e]'}
                  `}
                >
                  NovaHub Editor
                </h1>
                <p className="text-sm mb-8">Professional web-based code editor</p>
                <div className="flex flex-col gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <kbd
                      className={`
                        px-2 py-1 rounded text-xs
                        ${theme === 'dark' ? 'bg-[#3c3c3c]' : 'bg-[#e8e8e8]'}
                      `}
                    >
                      Ctrl+Shift+E
                    </kbd>
                    <span>Toggle Explorer</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd
                      className={`
                        px-2 py-1 rounded text-xs
                        ${theme === 'dark' ? 'bg-[#3c3c3c]' : 'bg-[#e8e8e8]'}
                      `}
                    >
                      Ctrl+`
                    </kbd>
                    <span>Toggle Terminal</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd
                      className={`
                        px-2 py-1 rounded text-xs
                        ${theme === 'dark' ? 'bg-[#3c3c3c]' : 'bg-[#e8e8e8]'}
                      `}
                    >
                      Ctrl+W
                    </kbd>
                    <span>Close Editor</span>
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
                  theme={theme}
                  isVisible={showTerminal}
                  onClose={() => setShowTerminal(false)}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <StatusBar info={statusBarInfo} theme={theme} />
    </div>
  );
}

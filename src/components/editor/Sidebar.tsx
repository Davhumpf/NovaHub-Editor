'use client';

import React from 'react';
import { ActivityBarView } from '@/types/editor';
import { useTheme } from '@/contexts/ThemeContext';
import FileExplorer from './FileExplorer';
import SearchPanel from '../panels/SearchPanel';
import GitPanel from '../panels/GitPanel';
import DebugPanel from '../panels/DebugPanel';
import ExtensionsPanel from '../panels/ExtensionsPanel';
import ResizeHandle from './ResizeHandle';

interface SidebarProps {
  activeView: ActivityBarView;
  theme?: 'dark' | 'light';
  size: number;
  isResizing: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
}

export default function Sidebar({
  activeView,
  theme: legacyTheme = 'dark',
  size,
  isResizing,
  onMouseDown,
}: SidebarProps) {
  const { theme } = useTheme();

  const renderContent = () => {
    switch (activeView) {
      case 'explorer':
        return <FileExplorer theme={legacyTheme} />;
      case 'search':
        return <SearchPanel theme={legacyTheme} />;
      case 'git':
        return <GitPanel theme={legacyTheme} />;
      case 'debug':
        return <DebugPanel theme={legacyTheme} />;
      case 'extensions':
        return <ExtensionsPanel theme={legacyTheme} />;
      default:
        return null;
    }
  };

  return (
    <>
      <div
        className="flex flex-col h-full"
        style={{
          width: `${size}px`,
          backgroundColor: theme.colors.sidebarBackground,
        }}
      >
        {/* Header */}
        <div
          className="px-4 py-2 border-b"
          style={{ borderColor: theme.colors.sidebarBorder }}
        >
          <h2
            className="text-xs font-semibold uppercase tracking-wide"
            style={{ color: theme.colors.sidebarForeground }}
          >
            {activeView === 'explorer' && 'Explorer'}
            {activeView === 'search' && 'Search'}
            {activeView === 'git' && 'Source Control'}
            {activeView === 'debug' && 'Run and Debug'}
            {activeView === 'extensions' && 'Extensions'}
          </h2>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {renderContent()}
        </div>
      </div>

      {/* Resize handle */}
      <ResizeHandle
        direction="horizontal"
        onMouseDown={onMouseDown}
        isResizing={isResizing}
      />
    </>
  );
}

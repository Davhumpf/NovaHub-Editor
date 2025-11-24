'use client';

import React from 'react';
import { ActivityBarView } from '@/types/editor';
import FileExplorer from './FileExplorer';
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
  theme = 'dark',
  size,
  isResizing,
  onMouseDown,
}: SidebarProps) {
  const renderContent = () => {
    switch (activeView) {
      case 'explorer':
        return <FileExplorer theme={theme} />;
      case 'search':
        return (
          <div
            className={`
              flex flex-col items-center justify-center h-full p-4
              ${theme === 'dark' ? 'text-[#858585]' : 'text-[#6c6c6c]'}
            `}
          >
            <p className="text-sm">Search (Coming soon)</p>
          </div>
        );
      case 'git':
        return (
          <div
            className={`
              flex flex-col items-center justify-center h-full p-4
              ${theme === 'dark' ? 'text-[#858585]' : 'text-[#6c6c6c]'}
            `}
          >
            <p className="text-sm">Source Control (Coming soon)</p>
          </div>
        );
      case 'debug':
        return (
          <div
            className={`
              flex flex-col items-center justify-center h-full p-4
              ${theme === 'dark' ? 'text-[#858585]' : 'text-[#6c6c6c]'}
            `}
          >
            <p className="text-sm">Run & Debug (Coming soon)</p>
          </div>
        );
      case 'extensions':
        return (
          <div
            className={`
              flex flex-col items-center justify-center h-full p-4
              ${theme === 'dark' ? 'text-[#858585]' : 'text-[#6c6c6c]'}
            `}
          >
            <p className="text-sm">Extensions (Coming soon)</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div
        className={`
          flex flex-col h-full
          ${theme === 'dark' ? 'bg-[#252526]' : 'bg-[#f3f3f3]'}
        `}
        style={{ width: `${size}px` }}
      >
        {/* Header */}
        <div
          className={`
            px-4 py-2 border-b
            ${theme === 'dark' ? 'border-[#2d2d2d]' : 'border-[#e5e5e5]'}
          `}
        >
          <h2
            className={`
              text-xs font-semibold uppercase tracking-wide
              ${theme === 'dark' ? 'text-[#cccccc]' : 'text-[#1e1e1e]'}
            `}
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

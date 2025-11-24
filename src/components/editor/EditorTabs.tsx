'use client';

import React from 'react';
import { VscClose, VscCircleFilled } from 'react-icons/vsc';
import { getFileIcon } from '@/utils/fileIcons';
import { EditorTab } from '@/types/editor';

interface EditorTabsProps {
  tabs: EditorTab[];
  activeTabId: string | null;
  onTabClick: (id: string) => void;
  onTabClose: (id: string) => void;
  theme?: 'dark' | 'light';
}

export default function EditorTabs({
  tabs,
  activeTabId,
  onTabClick,
  onTabClose,
  theme = 'dark',
}: EditorTabsProps) {
  if (tabs.length === 0) return null;

  return (
    <div
      className={`
        flex items-center overflow-x-auto
        ${theme === 'dark' ? 'bg-[#252526]' : 'bg-[#f3f3f3]'}
        border-b
        ${theme === 'dark' ? 'border-[#2d2d2d]' : 'border-[#e5e5e5]'}
      `}
      style={{ scrollbarWidth: 'thin' }}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId;

        return (
          <div
            key={tab.id}
            onClick={() => onTabClick(tab.id)}
            className={`
              group flex items-center gap-2 px-3 py-2
              border-r min-w-[120px] max-w-[200px]
              cursor-pointer select-none
              ${theme === 'dark' ? 'border-[#2d2d2d]' : 'border-[#e5e5e5]'}
              ${isActive
                ? theme === 'dark'
                  ? 'bg-[#1e1e1e] text-white'
                  : 'bg-white text-[#1e1e1e]'
                : theme === 'dark'
                  ? 'bg-[#2d2d2d] text-[#858585] hover:bg-[#2a2a2a]'
                  : 'bg-[#ececec] text-[#6c6c6c] hover:bg-[#e8e8e8]'
              }
              transition-colors
            `}
          >
            {/* File icon */}
            <div className="flex-shrink-0">
              {getFileIcon(tab.name)}
            </div>

            {/* File name */}
            <span className="flex-1 truncate text-sm">
              {tab.name}
            </span>

            {/* Dirty indicator or close button */}
            <div className="flex-shrink-0 flex items-center justify-center w-4 h-4">
              {tab.isDirty ? (
                <VscCircleFilled
                  className={`
                    w-2.5 h-2.5
                    ${theme === 'dark' ? 'text-white' : 'text-[#1e1e1e]'}
                  `}
                  title="Unsaved changes"
                />
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onTabClose(tab.id);
                  }}
                  className={`
                    opacity-0 group-hover:opacity-100
                    transition-opacity
                    ${theme === 'dark'
                      ? 'hover:bg-[#424242]'
                      : 'hover:bg-[#d0d0d0]'
                    }
                    rounded p-0.5
                  `}
                  title="Close (Ctrl+W)"
                >
                  <VscClose className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

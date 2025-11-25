"use client";
import React from 'react';
import { VscClose, VscCircleFilled } from 'react-icons/vsc';
import { useTheme } from '@/contexts/ThemeContext';
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
  theme: legacyTheme = 'dark' 
}: EditorTabsProps) {
  const theme = useTheme();

  if (tabs.length === 0) return null;

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    
    const iconMap: Record<string, string> = {
      'js': '📜',
      'ts': '🔷',
      'jsx': '⚛️',
      'tsx': '⚛️',
      'py': '🐍',
      'java': '☕',
      'html': '🌐',
      'css': '🎨',
      'json': '📋',
      'md': '📝',
      'xml': '📄',
      'yml': '⚙️',
      'yaml': '⚙️',
    };

    return iconMap[ext || ''] || '📄';
  };

  return (
    <div 
      className="flex items-center h-9 border-b overflow-x-auto scrollbar-thin"
      style={{ 
        backgroundColor: theme.colors.backgroundSecondary,
        borderColor: theme.colors.borderColor 
      }}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId;
        
        return (
          <div
            key={tab.id}
            className="flex items-center gap-2 px-3 h-full border-r cursor-pointer group relative flex-shrink-0"
            style={{
              backgroundColor: isActive 
                ? theme.colors.background 
                : 'transparent',
              borderColor: theme.colors.borderColor,
              color: isActive 
                ? theme.colors.foreground 
                : theme.colors.foregroundMuted
            }}
            onClick={() => onTabClick(tab.id)}
          >
            {/* File Icon */}
            <span className="text-sm flex-shrink-0">
              {getFileIcon(tab.name)}
            </span>

            {/* File Name */}
            <span className="text-sm truncate max-w-32">
              {tab.name}
            </span>

            {/* Dirty Indicator (unsaved changes) */}
            {tab.isDirty && (
              <VscCircleFilled 
                className="w-2 h-2 flex-shrink-0" 
                style={{ color: theme.colors.accent }}
              />
            )}

            {/* Close Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTabClose(tab.id);
              }}
              className="p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-white/10 transition-opacity flex-shrink-0"
              style={{ color: theme.colors.foreground }}
            >
              <VscClose className="w-3 h-3" />
            </button>

            {/* Active Tab Indicator */}
            {isActive && (
              <div 
                className="absolute bottom-0 left-0 right-0 h-0.5"
                style={{ backgroundColor: theme.colors.accent }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

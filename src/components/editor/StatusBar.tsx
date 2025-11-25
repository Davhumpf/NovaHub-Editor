"use client";
import React from 'react';
import { 
  VscError, 
  VscWarning, 
  VscSourceControl, 
  VscFeedback,
  VscBell,
  VscRemote
} from 'react-icons/vsc';
import { useTheme } from '@/contexts/ThemeContext';
import { StatusBarInfo } from '@/types/editor';

interface StatusBarProps {
  info: StatusBarInfo;
  theme?: 'dark' | 'light';
}

export default function StatusBar({ info, theme: legacyTheme = 'dark' }: StatusBarProps) {
  const theme = useTheme();

  return (
    <div 
      className="flex items-center justify-between h-6 px-3 text-xs border-t"
      style={{ 
        backgroundColor: theme.colors.statusBarBackground || '#007ACC',
        color: theme.colors.statusBarForeground || '#ffffff',
        borderColor: theme.colors.borderColor
      }}
    >
      {/* Left Section */}
      <div className="flex items-center gap-3">
        {/* Git Branch */}
        {info.gitBranch && (
          <div className="flex items-center gap-1 cursor-pointer hover:bg-white/10 px-2 py-0.5 rounded">
            <VscSourceControl className="w-4 h-4" />
            <span>{info.gitBranch}</span>
          </div>
        )}

        {/* Errors */}
        {info.errors > 0 && (
          <div className="flex items-center gap-1 cursor-pointer hover:bg-white/10 px-2 py-0.5 rounded">
            <VscError className="w-4 h-4" />
            <span>{info.errors}</span>
          </div>
        )}

        {/* Warnings */}
        {info.warnings > 0 && (
          <div className="flex items-center gap-1 cursor-pointer hover:bg-white/10 px-2 py-0.5 rounded">
            <VscWarning className="w-4 h-4" />
            <span>{info.warnings}</span>
          </div>
        )}
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        {/* Line & Column */}
        <div className="flex items-center gap-1 cursor-pointer hover:bg-white/10 px-2 py-0.5 rounded">
          <span>Ln {info.lineNumber}, Col {info.columnNumber}</span>
        </div>

        {/* Language */}
        <div className="cursor-pointer hover:bg-white/10 px-2 py-0.5 rounded">
          <span>{info.language.toUpperCase()}</span>
        </div>

        {/* Encoding */}
        <div className="cursor-pointer hover:bg-white/10 px-2 py-0.5 rounded">
          <span>{info.encoding}</span>
        </div>

        {/* EOL */}
        <div className="cursor-pointer hover:bg-white/10 px-2 py-0.5 rounded">
          <span>{info.eol}</span>
        </div>

        {/* Notifications */}
        <div className="cursor-pointer hover:bg-white/10 p-1 rounded">
          <VscBell className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}

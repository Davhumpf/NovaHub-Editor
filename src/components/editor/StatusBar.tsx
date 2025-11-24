'use client';

import React from 'react';
import { VscError, VscWarning, VscSourceControl } from 'react-icons/vsc';
import { StatusBarInfo } from '@/types/editor';

interface StatusBarProps {
  info: StatusBarInfo;
  theme?: 'dark' | 'light';
}

export default function StatusBar({ info, theme = 'dark' }: StatusBarProps) {
  const {
    lineNumber,
    columnNumber,
    language,
    encoding,
    eol,
    gitBranch,
    errors,
    warnings,
  } = info;

  return (
    <div
      className={`
        flex items-center justify-between px-4 py-0
        h-[22px] text-xs
        ${theme === 'dark'
          ? 'bg-[#007ACC] text-white'
          : 'bg-[#0066b8] text-white'
        }
      `}
    >
      {/* Left section */}
      <div className="flex items-center gap-4">
        {/* Git branch */}
        {gitBranch && (
          <div className="flex items-center gap-1 cursor-pointer hover:bg-white/10 px-2 py-0.5 rounded">
            <VscSourceControl className="h-3 w-3" />
            <span>{gitBranch}</span>
          </div>
        )}

        {/* Errors */}
        {errors > 0 && (
          <div className="flex items-center gap-1 cursor-pointer hover:bg-white/10 px-2 py-0.5 rounded">
            <VscError className="h-3 w-3" />
            <span>{errors}</span>
          </div>
        )}

        {/* Warnings */}
        {warnings > 0 && (
          <div className="flex items-center gap-1 cursor-pointer hover:bg-white/10 px-2 py-0.5 rounded">
            <VscWarning className="h-3 w-3" />
            <span>{warnings}</span>
          </div>
        )}
      </div>

      {/* Right section */}
      <div className="flex items-center gap-4">
        {/* Line and column */}
        <div className="cursor-pointer hover:bg-white/10 px-2 py-0.5 rounded">
          Ln {lineNumber}, Col {columnNumber}
        </div>

        {/* Language */}
        <div className="cursor-pointer hover:bg-white/10 px-2 py-0.5 rounded">
          {language}
        </div>

        {/* Encoding */}
        <div className="cursor-pointer hover:bg-white/10 px-2 py-0.5 rounded">
          {encoding}
        </div>

        {/* EOL */}
        <div className="cursor-pointer hover:bg-white/10 px-2 py-0.5 rounded">
          {eol}
        </div>
      </div>
    </div>
  );
}

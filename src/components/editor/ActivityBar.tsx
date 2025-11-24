'use client';

import React from 'react';
import {
  VscFiles,
  VscSearch,
  VscSourceControl,
  VscDebugAlt,
  VscExtensions,
  VscSettingsGear,
} from 'react-icons/vsc';
import { ActivityBarView } from '@/types/editor';

interface ActivityBarProps {
  activeView: ActivityBarView;
  onViewChange: (view: ActivityBarView) => void;
  theme?: 'dark' | 'light';
}

interface ActivityItem {
  id: ActivityBarView;
  icon: React.ReactNode;
  label: string;
  shortcut?: string;
}

export default function ActivityBar({ activeView, onViewChange, theme = 'dark' }: ActivityBarProps) {
  const activities: ActivityItem[] = [
    {
      id: 'explorer',
      icon: <VscFiles className="h-6 w-6" />,
      label: 'Explorer',
      shortcut: 'Ctrl+Shift+E',
    },
    {
      id: 'search',
      icon: <VscSearch className="h-6 w-6" />,
      label: 'Search',
      shortcut: 'Ctrl+Shift+F',
    },
    {
      id: 'git',
      icon: <VscSourceControl className="h-6 w-6" />,
      label: 'Source Control',
      shortcut: 'Ctrl+Shift+G',
    },
    {
      id: 'debug',
      icon: <VscDebugAlt className="h-6 w-6" />,
      label: 'Run and Debug',
      shortcut: 'Ctrl+Shift+D',
    },
    {
      id: 'extensions',
      icon: <VscExtensions className="h-6 w-6" />,
      label: 'Extensions',
      shortcut: 'Ctrl+Shift+X',
    },
  ];

  return (
    <div
      className={`
        flex flex-col h-full w-12
        ${theme === 'dark' ? 'bg-[#333333]' : 'bg-[#f3f3f3]'}
        border-r
        ${theme === 'dark' ? 'border-[#2d2d2d]' : 'border-[#e5e5e5]'}
      `}
    >
      {/* Activity icons */}
      <div className="flex-1 flex flex-col items-center py-2">
        {activities.map((activity) => (
          <button
            key={activity.id}
            onClick={() => onViewChange(activity.id)}
            title={`${activity.label} (${activity.shortcut})`}
            className={`
              relative w-12 h-12 flex items-center justify-center
              transition-colors
              ${activeView === activity.id
                ? theme === 'dark'
                  ? 'text-white'
                  : 'text-[#1e1e1e]'
                : theme === 'dark'
                  ? 'text-[#858585] hover:text-white'
                  : 'text-[#6c6c6c] hover:text-[#1e1e1e]'
              }
            `}
          >
            {/* Active indicator */}
            {activeView === activity.id && (
              <div
                className={`
                  absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-8
                  ${theme === 'dark' ? 'bg-white' : 'bg-[#007ACC]'}
                `}
              />
            )}
            {activity.icon}
          </button>
        ))}
      </div>

      {/* Settings at the bottom */}
      <div className="flex flex-col items-center pb-2">
        <button
          title="Settings"
          className={`
            w-12 h-12 flex items-center justify-center
            transition-colors
            ${theme === 'dark'
              ? 'text-[#858585] hover:text-white'
              : 'text-[#6c6c6c] hover:text-[#1e1e1e]'
            }
          `}
        >
          <VscSettingsGear className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
}

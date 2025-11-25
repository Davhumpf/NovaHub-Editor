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
import { useTheme } from '@/contexts/ThemeContext';

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

export default function ActivityBar({ activeView, onViewChange }: ActivityBarProps) {
  const { theme } = useTheme();
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
      className="flex flex-col h-full w-[56px] border-r backdrop-blur-sm"
      style={{
        background: `linear-gradient(180deg, ${theme.colors.activityBarBackground} 0%, ${theme.colors.background} 100%)`,
        borderColor: theme.colors.activityBarBorder,
        boxShadow: 'inset -1px 0 0 rgba(255,255,255,0.04)',
      }}
    >
      {/* Activity icons */}
      <div className="flex-1 flex flex-col items-center py-2 gap-1">
        {activities.map((activity) => (
          <button
            key={activity.id}
            onClick={() => onViewChange(activity.id)}
            title={`${activity.label} (${activity.shortcut})`}
            className="relative w-12 h-12 flex items-center justify-center transition-all rounded-xl"
            style={{
              color: activeView === activity.id
                ? theme.colors.accent
                : theme.colors.activityBarInactiveForeground,
              backgroundColor: activeView === activity.id ? `${theme.colors.accent}15` : 'transparent',
              boxShadow: activeView === activity.id ? '0 10px 30px rgba(52, 227, 156, 0.12)' : 'none',
            }}
          >
            {/* Active indicator */}
            {activeView === activity.id && (
              <div
                className="absolute left-1 top-1/2 -translate-y-1/2 w-0.5 h-8 rounded"
                style={{ backgroundColor: theme.colors.accent }}
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
          className="w-12 h-12 flex items-center justify-center transition-colors rounded-xl"
          style={{ color: theme.colors.activityBarInactiveForeground }}
        >
          <VscSettingsGear className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
}

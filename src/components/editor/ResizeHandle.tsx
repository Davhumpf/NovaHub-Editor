"use client";

import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface ResizeHandleProps {
  direction: 'horizontal' | 'vertical';
  onMouseDown: (e: React.MouseEvent) => void;
  isResizing: boolean;
}

export default function ResizeHandle({ direction, onMouseDown, isResizing }: ResizeHandleProps) {
  const theme = useTheme();
  const isHorizontal = direction === 'horizontal';

  return (
    <div
      onMouseDown={onMouseDown}
      className={`group flex ${isHorizontal ? 'w-1 cursor-ew-resize' : 'h-1 cursor-ns-resize'} select-none items-center justify-center`}
      style={{ backgroundColor: isResizing ? `${theme.colors.accent}50` : `${theme.colors.border}50` }}
      role="separator"
      aria-orientation={isHorizontal ? 'vertical' : 'horizontal'}
    >
      <div
        className={`${isHorizontal ? 'h-full w-px' : 'w-full h-px'} transition-colors group-hover:bg-[#007acc]`}
        style={{
          border: '1px solid #3e3e42',
          backgroundColor: isResizing ? '#007acc' : '#3e3e42',
        }}
      />
    </div>
  );
}

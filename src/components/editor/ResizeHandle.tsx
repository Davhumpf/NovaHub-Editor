"use client";
import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface ResizeHandleProps {
  direction: 'horizontal' | 'vertical';
  onMouseDown: (e: React.MouseEvent) => void;
  isResizing: boolean;
}

export default function ResizeHandle({ 
  direction, 
  onMouseDown, 
  isResizing 
}: ResizeHandleProps) {
  const theme = useTheme();

  return (
    <div
      className={`
        transition-colors
        ${direction === 'horizontal' 
          ? 'w-1 cursor-ew-resize hover:bg-blue-500' 
          : 'h-1 cursor-ns-resize hover:bg-blue-500'
        }
        ${isResizing ? 'bg-blue-500' : ''}
      `}
      style={{ 
        backgroundColor: isResizing 
          ? theme.colors.accent 
          : theme.colors.borderColor 
      }}
      onMouseDown={onMouseDown}
    />
  );
}

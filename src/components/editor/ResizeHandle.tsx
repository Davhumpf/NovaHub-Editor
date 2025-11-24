'use client';

import React from 'react';

interface ResizeHandleProps {
  direction: 'horizontal' | 'vertical';
  onMouseDown: (e: React.MouseEvent) => void;
  isResizing?: boolean;
}

export default function ResizeHandle({ direction, onMouseDown, isResizing }: ResizeHandleProps) {
  return (
    <div
      className={`
        group
        ${direction === 'horizontal'
          ? 'w-1 cursor-col-resize hover:bg-blue-500/50'
          : 'h-1 cursor-row-resize hover:bg-blue-500/50'
        }
        ${isResizing ? 'bg-blue-500' : 'bg-transparent'}
        transition-colors
        relative
        z-10
      `}
      onMouseDown={onMouseDown}
    >
      {/* Visual indicator on hover */}
      <div
        className={`
          absolute inset-0
          ${direction === 'horizontal' ? 'w-1' : 'h-1'}
          ${isResizing ? 'bg-blue-500' : 'group-hover:bg-blue-500/30'}
        `}
      />
    </div>
  );
}

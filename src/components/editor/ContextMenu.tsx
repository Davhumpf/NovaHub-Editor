"use client";
import React, { useEffect, useRef } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface ContextMenuItem {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  separator?: boolean;
  danger?: boolean;
  disabled?: boolean;
}

interface ContextMenuProps {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}

export default function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
  const theme = useTheme();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  // Adjust position if menu goes off screen
  useEffect(() => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const adjustedX = x + rect.width > window.innerWidth ? window.innerWidth - rect.width - 10 : x;
      const adjustedY = y + rect.height > window.innerHeight ? window.innerHeight - rect.height - 10 : y;
      
      menuRef.current.style.left = `${adjustedX}px`;
      menuRef.current.style.top = `${adjustedY}px`;
    }
  }, [x, y]);

  return (
    <div
      ref={menuRef}
      className="fixed z-50 min-w-48 py-1 rounded shadow-lg border"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        backgroundColor: theme.colors.backgroundSecondary,
        borderColor: theme.colors.borderColor,
      }}
    >
      {items.map((item, index) => {
        if (item.separator) {
          return (
            <div 
              key={index} 
              className="my-1 h-px" 
              style={{ backgroundColor: theme.colors.borderColor }}
            />
          );
        }

        return (
          <button
            key={index}
            onClick={() => {
              if (!item.disabled) {
                item.onClick();
                onClose();
              }
            }}
            disabled={item.disabled}
            className={`
              w-full px-3 py-1.5 text-left text-sm flex items-center gap-2
              transition-colors
              ${item.disabled 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:bg-white/10 cursor-pointer'
              }
              ${item.danger ? 'text-red-400' : ''}
            `}
            style={{ 
              color: item.danger 
                ? '#f87171' 
                : theme.colors.foreground 
            }}
          >
            {item.icon && <span className="w-4 h-4">{item.icon}</span>}
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}

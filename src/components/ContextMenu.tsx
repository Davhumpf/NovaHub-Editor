// src/components/ContextMenu.tsx
'use client';
import React from 'react';

interface ContextMenuProps {
  visible: boolean;
  position: { x: number; y: number };
  options: { label: string; onClick: () => void }[];
  onClose: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  visible,
  position,
  options,
  onClose
}) => {
  React.useEffect(() => {
    if (visible) {
      const handler = () => onClose();
      window.addEventListener('click', handler);
      return () => window.removeEventListener('click', handler);
    }
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <div
      className="fixed z-50 bg-zinc-800 border border-zinc-700 rounded shadow-lg"
      style={{
        top: position.y,
        left: position.x,
        minWidth: 180,
        padding: 6,
      }}
    >
      {options.map((opt, idx) => (
        <button
          key={idx}
          className="block w-full px-4 py-2 text-left text-zinc-200 hover:bg-zinc-700 rounded"
          onClick={() => {
            opt.onClick();
            onClose();
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
};

export default ContextMenu;

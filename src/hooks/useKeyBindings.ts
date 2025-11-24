import { useEffect } from 'react';

export interface KeyBinding {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  callback: () => void;
}

export function useKeyBindings(bindings: KeyBinding[]) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      for (const binding of bindings) {
        const keyMatch = e.key.toLowerCase() === binding.key.toLowerCase();
        const ctrlMatch = binding.ctrl === undefined || binding.ctrl === (e.ctrlKey || e.metaKey);
        const shiftMatch = binding.shift === undefined || binding.shift === e.shiftKey;
        const altMatch = binding.alt === undefined || binding.alt === e.altKey;
        const metaMatch = binding.meta === undefined || binding.meta === e.metaKey;

        if (keyMatch && ctrlMatch && shiftMatch && altMatch && metaMatch) {
          e.preventDefault();
          binding.callback();
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [bindings]);
}

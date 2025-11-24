import { useState, useCallback, useEffect, useRef } from 'react';

export interface UseResizableOptions {
  initialSize: number;
  minSize: number;
  maxSize: number;
  direction: 'horizontal' | 'vertical';
}

export function useResizable({ initialSize, minSize, maxSize, direction }: UseResizableOptions) {
  const [size, setSize] = useState(initialSize);
  const [isResizing, setIsResizing] = useState(false);
  const startPos = useRef(0);
  const startSize = useRef(initialSize);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    startPos.current = direction === 'horizontal' ? e.clientX : e.clientY;
    startSize.current = size;
  }, [direction, size]);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const currentPos = direction === 'horizontal' ? e.clientX : e.clientY;
      const delta = currentPos - startPos.current;
      const newSize = Math.max(minSize, Math.min(maxSize, startSize.current + delta));
      setSize(newSize);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, direction, minSize, maxSize]);

  return {
    size,
    isResizing,
    handleMouseDown,
  };
}

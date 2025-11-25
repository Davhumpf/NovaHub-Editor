"use client";
import React from 'react';
import EditorLayoutNew from '@/components/editor/EditorLayoutNew';
import { ThemeProvider } from '@/contexts/ThemeContext';

export default function WorkspacePage() {
  return (
    <ThemeProvider>
      <div className="h-screen overflow-hidden">
        <EditorLayoutNew />
      </div>
    </ThemeProvider>
  );
}

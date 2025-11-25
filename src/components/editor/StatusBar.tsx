"use client";

import React from 'react';
import { VscSourceControl, VscWarning, VscError, VscDebugConsole } from 'react-icons/vsc';
import { useTheme } from '@/contexts/ThemeContext';
import { StatusBarInfo } from '@/types/editor';

interface StatusBarProps {
  info: StatusBarInfo;
  terminalVisible?: boolean;
  onToggleTerminal?: () => void;
  theme?: 'dark' | 'light';
}

export default function StatusBar({ info, terminalVisible = false, onToggleTerminal }: StatusBarProps) {
  const theme = useTheme();

  return (
    <div
      className="flex h-6 items-center justify-between px-3 text-[11px] border-t shrink-0"
      style={{
        backgroundColor: theme.colors.statusBarBackground || '#0e0e0e',
        color: theme.colors.statusBarForeground || '#ffffff',
        borderColor: theme.colors.borderColor,
      }}
    >
      {/* Sección izquierda: estado del repositorio y diagnósticos */}
      <div className="flex items-center gap-3">
        <div
          className="flex items-center gap-1 px-2 py-0.5 rounded cursor-pointer"
          style={{ backgroundColor: `${theme.colors.backgroundTertiary}40`, border: `1px solid ${theme.colors.border}` }}
          aria-label="Rama de Git activa"
        >
          <VscSourceControl className="w-4 h-4" />
          <span>{info.gitBranch ? `🌿 ${info.gitBranch}` : 'Sin rama'}</span>
        </div>

        <div className="flex items-center gap-2" aria-label="Errores y advertencias">
          <div className="flex items-center gap-1 px-2 py-0.5 rounded" style={{ backgroundColor: `${theme.colors.backgroundTertiary}20` }}>
            <VscError className="w-4 h-4" />
            <span>❌ {info.errors}</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded" style={{ backgroundColor: `${theme.colors.backgroundTertiary}20` }}>
            <VscWarning className="w-4 h-4" />
            <span>⚠️ {info.warnings}</span>
          </div>
        </div>
      </div>

      {/* Sección derecha: datos del editor y botón del terminal */}
      <div className="flex items-center gap-3">
        <div className="px-2 py-0.5 rounded" style={{ backgroundColor: `${theme.colors.backgroundTertiary}20` }} aria-label="Posición del cursor">
          Ln {info.lineNumber}, Col {info.columnNumber}
        </div>
        <div className="px-2 py-0.5 rounded" style={{ backgroundColor: `${theme.colors.backgroundTertiary}20` }} aria-label="Lenguaje activo">
          {info.language}
        </div>
        <div className="px-2 py-0.5 rounded" style={{ backgroundColor: `${theme.colors.backgroundTertiary}20` }} aria-label="Codificación">
          {info.encoding}
        </div>
        <div className="px-2 py-0.5 rounded" style={{ backgroundColor: `${theme.colors.backgroundTertiary}20` }} aria-label="Fin de línea">
          {info.eol}
        </div>
        <div className="px-2 py-0.5 rounded" style={{ backgroundColor: `${theme.colors.backgroundTertiary}20` }} aria-label="Tipo de indentación">
          {info.indentation}
        </div>
        <button
          type="button"
          onClick={onToggleTerminal ?? (() => {})}
          className="flex items-center gap-1 px-2 py-0.5 rounded transition"
          style={{
            backgroundColor: terminalVisible ? theme.colors.accent : `${theme.colors.backgroundTertiary}40`,
            color: terminalVisible ? '#031410' : theme.colors.statusBarForeground,
            border: `1px solid ${theme.colors.border}`,
          }}
          aria-label="Alternar terminal"
        >
          <VscDebugConsole className="w-4 h-4" />
          <span>⌨️</span>
        </button>
      </div>
    </div>
  );
}

"use client";
import React, { useState } from 'react';
import { 
  VscDebugAlt, 
  VscPlay, 
  VscDebugRestart,
  VscDebugStop,
  VscDebugStepOver,
  VscDebugStepInto,
  VscDebugStepOut,
  VscCircleFilled
} from 'react-icons/vsc';
import { useTheme } from '@/contexts/ThemeContext';

interface DebugPanelProps {
  theme?: 'dark' | 'light';
}

export default function DebugPanel({ theme: legacyTheme = 'dark' }: DebugPanelProps) {
  const theme = useTheme();
  const [isDebugging, setIsDebugging] = useState(false);

  return (
    <div className="flex flex-col h-full" style={{ color: theme.colors.foreground }}>
      {/* Header */}
      <div className="p-3 border-b" style={{ borderColor: theme.colors.borderColor }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <VscDebugAlt className="w-5 h-5" />
            <span className="text-sm font-semibold">Ejecutar y depurar</span>
          </div>
        </div>
      </div>

      {!isDebugging ? (
        /* Not Debugging State */
        <div className="flex-1 flex flex-col items-center justify-center p-4 text-center" style={{ color: theme.colors.foregroundMuted }}>
          <VscDebugAlt className="w-16 h-16 mb-4 opacity-50" />
          <p className="text-sm mb-4">Para personalizar la ejecución y depuración, crea un archivo launch.json</p>
          <button
            onClick={() => setIsDebugging(true)}
            className="flex items-center gap-2 px-4 py-2 rounded text-sm"
            style={{
              backgroundColor: theme.colors.accent,
              color: '#ffffff'
            }}
          >
            <VscPlay className="w-4 h-4" />
            Ejecutar y depurar
          </button>
        </div>
      ) : (
        /* Debugging State */
        <>
          {/* Debug Controls */}
          <div className="p-3 border-b" style={{ borderColor: theme.colors.borderColor }}>
            <div className="flex items-center gap-1">
              <button
                className="p-2 rounded hover:bg-white/10"
                title="Continuar (F5)"
              >
                <VscPlay className="w-5 h-5" />
              </button>
              <button
                className="p-2 rounded hover:bg-white/10"
                title="Paso sobre (F10)"
              >
                <VscDebugStepOver className="w-5 h-5" />
              </button>
              <button
                className="p-2 rounded hover:bg-white/10"
                title="Paso dentro (F11)"
              >
                <VscDebugStepInto className="w-5 h-5" />
              </button>
              <button
                className="p-2 rounded hover:bg-white/10"
                title="Paso fuera (Shift+F11)"
              >
                <VscDebugStepOut className="w-5 h-5" />
              </button>
              <button
                className="p-2 rounded hover:bg-white/10"
                title="Reiniciar (Ctrl+Shift+F5)"
              >
                <VscDebugRestart className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsDebugging(false)}
                className="p-2 rounded hover:bg-white/10"
                title="Detener (Shift+F5)"
              >
                <VscDebugStop className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Debug Info */}
          <div className="flex-1 overflow-y-auto">
            {/* Variables */}
            <div className="p-3 border-b" style={{ borderColor: theme.colors.borderColor }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase" style={{ color: theme.colors.foregroundMuted }}>
                  Variables
                </span>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2 p-1 rounded hover:bg-white/5">
                  <span>count:</span>
                  <span style={{ color: '#4ec9b0' }}>0</span>
                </div>
                <div className="flex items-center gap-2 p-1 rounded hover:bg-white/5">
                  <span>message:</span>
                  <span style={{ color: '#ce9178' }}>"Hello World"</span>
                </div>
                <div className="flex items-center gap-2 p-1 rounded hover:bg-white/5">
                  <span>isActive:</span>
                  <span style={{ color: '#569cd6' }}>true</span>
                </div>
              </div>
            </div>

            {/* Call Stack */}
            <div className="p-3 border-b" style={{ borderColor: theme.colors.borderColor }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase" style={{ color: theme.colors.foregroundMuted }}>
                  Pila de llamadas
                </span>
              </div>
              <div className="space-y-1 text-sm">
                <div className="p-2 rounded hover:bg-white/5 cursor-pointer">
                  <div style={{ color: theme.colors.foreground }}>handleClick</div>
                  <div className="text-xs" style={{ color: theme.colors.foregroundMuted }}>
                    App.tsx:24
                  </div>
                </div>
                <div className="p-2 rounded hover:bg-white/5 cursor-pointer">
                  <div style={{ color: theme.colors.foreground }}>onClick</div>
                  <div className="text-xs" style={{ color: theme.colors.foregroundMuted }}>
                    Button.tsx:12
                  </div>
                </div>
              </div>
            </div>

            {/* Breakpoints */}
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase" style={{ color: theme.colors.foregroundMuted }}>
                  Puntos de interrupción
                </span>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2 p-2 rounded hover:bg-white/5">
                  <VscCircleFilled className="w-3 h-3 text-red-500" />
                  <div className="flex-1">
                    <div style={{ color: theme.colors.foreground }}>App.tsx:24</div>
                    <div className="text-xs" style={{ color: theme.colors.foregroundMuted }}>
                      handleClick
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

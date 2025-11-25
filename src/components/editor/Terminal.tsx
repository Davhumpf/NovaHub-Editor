'use client';

import React, { useEffect, useRef, useState } from 'react';
import { VscClose, VscAdd, VscTrash } from 'react-icons/vsc';

// Import xterm dynamically to avoid SSR issues
let Terminal: any;
let FitAddon: any;

if (typeof window !== 'undefined') {
  import('xterm').then(module => {
    Terminal = module.Terminal;
  });
  import('@xterm/addon-fit').then(module => {
    FitAddon = module.FitAddon;
  });
}

type TerminalShell = 'bash' | 'powershell' | 'cmd';

interface TerminalInstance {
  id: string;
  title: string;
  terminal: any;
  fitAddon: any;
  shell: TerminalShell;
  path: string;
}

interface TerminalProps {
  theme?: 'dark' | 'light';
  isVisible: boolean;
  onClose?: () => void;
}

export default function TerminalPanel({ theme = 'dark', isVisible, onClose }: TerminalProps) {
  const terminalContainerRef = useRef<HTMLDivElement>(null);
  const [terminals, setTerminals] = useState<TerminalInstance[]>([]);
  const [activeTerminalId, setActiveTerminalId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'terminal' | 'output' | 'problems' | 'debug'>('terminal');
  const [preferredShell, setPreferredShell] = useState<TerminalShell>('bash');
  const shellOptions: { id: TerminalShell; label: string }[] = [
    { id: 'bash', label: 'Bash' },
    { id: 'powershell', label: 'PowerShell' },
    { id: 'cmd', label: 'CMD' },
  ];

  const formatPrompt = (shell: TerminalShell, path: string) => {
    switch (shell) {
      case 'powershell':
        return `PS ${path}> `;
      case 'cmd':
        return `${path}> `;
      default:
        return `novahub@local:${path}$ `;
    }
  };

  const defaultPathForShell = (shell: TerminalShell) => {
    if (shell === 'bash') return '/home/novahub';
    if (shell === 'powershell') return 'C\\Users\\NovaHub';
    return 'C\\Users\\NovaHub';
  };

  const handleCommand = (
    terminal: any,
    command: string,
    shell: TerminalShell,
    currentPath: string,
  ): { newPath: string } => {
    const [rawCmd, ...args] = command.split(' ');
    const cmd = rawCmd.toLowerCase();

    const respondUnknown = () => {
      if (shell === 'cmd') {
        terminal.writeln(`'${rawCmd}' is not recognized as an internal or external command.`);
      } else if (shell === 'powershell') {
        terminal.writeln(`El término '${rawCmd}' no se reconoce como nombre de un cmdlet.`);
      } else {
        terminal.writeln(`${rawCmd}: command not found`);
      }
    };

    if (['clear', 'cls'].includes(cmd)) {
      terminal.clear();
          // Prevent showing command in history after clear
    terminal.write(formatPrompt(shell, currentPath))
          return { newPath: currentPath };
    }

    if (cmd === 'help') {
      terminal.writeln('Comandos rápidos disponibles:');
      terminal.writeln('  help                Ver esta ayuda');
      terminal.writeln('  clear / cls         Limpiar la terminal');
      terminal.writeln('  ls / dir            Listar el directorio actual');
      terminal.writeln('  pwd                 Mostrar ruta actual');
      terminal.writeln('  cd <ruta>           Cambiar ruta simulada');
      terminal.writeln('  echo <texto>        Imprimir texto');
      terminal.writeln('  date                Mostrar fecha actual');
      terminal.writeln('');
      return { newPath: currentPath };
    }

    if (cmd === 'echo') {
      terminal.writeln(args.join(' '));
      return { newPath: currentPath };
    }

    if (cmd === 'date') {
      terminal.writeln(new Date().toString());
      return { newPath: currentPath };
    }

    if (cmd === 'pwd') {
      terminal.writeln(currentPath);
      return { newPath: currentPath };
    }

    if (cmd === 'ls' || cmd === 'dir') {
      terminal.writeln('app/   src/   package.json   README.md');
      terminal.writeln('node_modules/   public/   tsconfig.json');
      return { newPath: currentPath };
    }

    if (cmd === 'cd') {
      if (!args[0]) {
        terminal.writeln(currentPath);
        return { newPath: currentPath };
      }
      const nextPath = args[0] === '..'
        ? currentPath.split(/[\\/]/).slice(0, -1).join(shell === 'bash' ? '/' : '\\') || (shell === 'bash' ? '/' : 'C:')
        : args[0].startsWith('/') || args[0].includes(':')
          ? args[0]
          : `${currentPath}${shell === 'bash' ? '/' : '\\'}${args[0]}`;

      terminal.writeln(`Ruta actualizada a ${nextPath}`);
      return { newPath: nextPath };
    }

    respondUnknown();
    return { newPath: currentPath };
  };

  const createTerminal = (shell: TerminalShell = preferredShell) => {
    if (!Terminal || !FitAddon) return;

    const terminalId = `terminal-${Date.now()}`;
    let workingDir = defaultPathForShell(shell);
    const terminal = new Terminal({
      theme: theme === 'dark' ? {
        background: '#1e1e1e',
        foreground: '#d4d4d4',
        cursor: '#ffffff',
        black: '#000000',
        red: '#cd3131',
        green: '#0dbc79',
        yellow: '#e5e510',
        blue: '#2472c8',
        magenta: '#bc3fbc',
        cyan: '#11a8cd',
        white: '#e5e5e5',
        brightBlack: '#666666',
        brightRed: '#f14c4c',
        brightGreen: '#23d18b',
        brightYellow: '#f5f543',
        brightBlue: '#3b8eea',
        brightMagenta: '#d670d6',
        brightCyan: '#29b8db',
        brightWhite: '#ffffff',
      } : {
        background: '#ffffff',
        foreground: '#1e1e1e',
        cursor: '#000000',
      },
      fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, 'Courier New', monospace",
      fontSize: 14,
      cursorBlink: true,
      cursorStyle: 'block',
      scrollback: 1000,
      tabStopWidth: 4,
    });

    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);

    terminal.writeln(`Perfil ${shell.toUpperCase()} iniciado`);
    terminal.writeln(`Ruta actual: ${workingDir}`);
    terminal.writeln('Comandos básicos disponibles: help, clear/cls, ls/dir, cd, pwd');
    terminal.writeln('');
    terminal.write(formatPrompt(shell, workingDir));

    let currentLine = '';
    terminal.onData((data: string) => {
      const code = data.charCodeAt(0);

      if (code === 13) {
        terminal.writeln('');
        if (currentLine.trim()) {
          const result = handleCommand(terminal, currentLine.trim(), shell, workingDir);
          workingDir = result.newPath;
        }
        currentLine = '';
        terminal.write(formatPrompt(shell, workingDir));
      } else if (code === 127) {
        if (currentLine.length > 0) {
          currentLine = currentLine.slice(0, -1);
          terminal.write('\b \b');
        }
      } else if (code >= 32) {
        currentLine += data;
        terminal.write(data);
      }
    });

    setTerminals((prev) => [
      ...prev,
      { id: terminalId, title: shell.toUpperCase(), terminal, fitAddon, shell, path: workingDir },
    ]);

    setTimeout(() => {
      if (terminalContainerRef.current) {
        const container = terminalContainerRef.current.querySelector(`#${terminalId}`);
        if (container) {
          terminal.open(container);
          fitAddon.fit();
        }
      }
    }, 0);
  };

  useEffect(() => {
    if (isVisible && terminals.length === 0 && Terminal && FitAddon) {
      createTerminal();
    }
  }, [isVisible, Terminal, FitAddon]);

  useEffect(() => {
    const handleResize = () => {
      terminals.forEach((t) => {
        try {
          t.fitAddon?.fit();
        } catch (e) {
          // ignore
        }
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [terminals]);

  const closeTerminal = (id: string) => {
    const terminal = terminals.find((t) => t.id === id);
    if (terminal) {
      terminal.terminal.dispose();
      setTerminals((prev) => prev.filter((t) => t.id !== id));
      if (activeTerminalId === id) {
        const remaining = terminals.filter((t) => t.id !== id);
        setActiveTerminalId(remaining[0]?.id || null);
      }
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={`
        flex flex-col h-full
        ${theme === 'dark' ? 'bg-[#0f172a]' : 'bg-white'}
      `}
    >
      <div
        className={`
          flex items-center justify-between border-b
          ${theme === 'dark' ? 'bg-[#111827] border-[#1f2937]' : 'bg-[#f3f3f3] border-[#e5e5e5]'}
        `}
      >
        <div className="flex items-center">
          {(['terminal', 'output', 'problems', 'debug'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                px-4 py-2 text-sm font-medium capitalize
                border-b-2 transition-colors
                ${activeTab === tab
                  ? theme === 'dark'
                    ? 'border-blue-500 text-white'
                    : 'border-blue-500 text-[#1e1e1e]'
                  : theme === 'dark'
                    ? 'border-transparent text-[#858585] hover:text-white'
                    : 'border-transparent text-[#6c6c6c] hover:text-[#1e1e1e]'
                }
              `}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 px-2">
          {activeTab === 'terminal' && (
            <>
              <select
                value={preferredShell}
                onChange={(e) => setPreferredShell(e.target.value as TerminalShell)}
                className={`text-xs px-2 py-1 rounded border focus:outline-none ${
                  theme === 'dark'
                    ? 'bg-[#0f172a] border-[#1f2937] text-[#cccccc]'
                    : 'bg-white border-[#d4d4d4] text-[#1e1e1e]'
                }`}
                aria-label="Seleccionar shell"
              >
                {shellOptions.map(option => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button
                onClick={() => createTerminal(preferredShell)}
                title="New Terminal"
                className={`${
                  theme === 'dark'
                    ? 'p-1.5 rounded hover:bg-[#1f2937] text-[#cccccc]'
                    : 'p-1.5 rounded hover:bg-[#e8e8e8] text-[#1e1e1e]'
                }`}
              >
                <VscAdd className="w-4 h-4" />
              </button>
              {terminals.length > 0 && (
                <button
                  onClick={() => activeTerminalId && closeTerminal(activeTerminalId)}
                  title="Kill Terminal"
                  className={`${
                    theme === 'dark'
                      ? 'p-1.5 rounded hover:bg-[#1f2937] text-[#cccccc]'
                      : 'p-1.5 rounded hover:bg-[#e8e8e8] text-[#1e1e1e]'
                  }`}
                >
                  <VscTrash className="w-4 h-4" />
                </button>
              )}
            </>
          )}
          <button
            onClick={onClose}
            title="Close Panel"
            className={`${
              theme === 'dark'
                ? 'p-1.5 rounded hover:bg-[#1f2937] text-[#cccccc]'
                : 'p-1.5 rounded hover:bg-[#e8e8e8] text-[#1e1e1e]'
            }`}
          >
            <VscClose className="w-4 h-4" />
          </button>
        </div>
      </div>

      {activeTab === 'terminal' && terminals.length > 0 && (
        <div
          className={`
            flex items-center gap-1 px-2 py-1 border-b
            ${theme === 'dark' ? 'bg-[#0b1322] border-[#1f2937]' : 'bg-[#f3f3f3] border-[#e5e5e5]'}
          `}
        >
          {terminals.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTerminalId(t.id)}
              className={`
                flex items-center gap-2 px-3 py-1 rounded text-xs
                ${activeTerminalId === t.id
                  ? theme === 'dark'
                    ? 'bg-[#111827] text-white'
                    : 'bg-white text-[#1e1e1e]'
                  : theme === 'dark'
                    ? 'text-[#858585] hover:bg-[#1f2937]'
                    : 'text-[#6c6c6c] hover:bg-[#e8e8e8]'
                }
              `}
            >
              <span>{t.title}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closeTerminal(t.id);
                }}
                className="hover:text-red-400"
              >
                <VscClose className="w-3 h-3" />
              </button>
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-hidden" ref={terminalContainerRef}>
        {activeTab === 'terminal' ? (
          <>
            {terminals.map((t) => (
              <div
                key={t.id}
                id={t.id}
                className={`h-full ${activeTerminalId === t.id ? 'block' : 'hidden'}`}
              />
            ))}
            {terminals.length === 0 && (
              <div
                className={`
                  flex flex-col items-center justify-center h-full
                  ${theme === 'dark' ? 'text-[#858585]' : 'text-[#6c6c6c]'}
                `}
              >
                <p className="text-sm mb-4">No hay instancias de terminal</p>
                <button
                  onClick={() => createTerminal()}
                  className={`
                    px-4 py-2 rounded text-sm
                    ${theme === 'dark'
                      ? 'bg-[#0e639c] hover:bg-[#1177bb] text-white'
                      : 'bg-[#0066b8] hover:bg-[#005a9e] text-white'
                    }
                  `}
                >
                  Crear Terminal
                </button>
              </div>
            )}
          </>
        ) : (
          <div
            className={`
              flex items-center justify-center h-full
              ${theme === 'dark' ? 'text-[#858585]' : 'text-[#6c6c6c]'}
            `}
          >
            <p className="text-sm">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} panel (Próximamente)</p>
          </div>
        )}
      </div>
    </div>
  );
}

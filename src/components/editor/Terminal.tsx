'use client';

import React, { useEffect, useRef, useState } from 'react';
import { VscClose, VscAdd, VscTrash, VscChevronDown, VscChevronUp } from 'react-icons/vsc';

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

interface TerminalInstance {
  id: string;
  title: string;
  terminal: any;
  fitAddon: any;
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

  // Create a new terminal instance
  const createTerminal = () => {
    if (!Terminal || !FitAddon) return;

    const terminalId = `terminal-${Date.now()}`;
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

    // Write welcome message
    terminal.writeln('Welcome to NovaHub Editor Terminal');
    terminal.writeln('This is a simulated terminal environment.');
    terminal.writeln('');
    terminal.write('$ ');

    // Handle input
    let currentLine = '';
    terminal.onData((data: string) => {
      const code = data.charCodeAt(0);

      // Handle enter key
      if (code === 13) {
        terminal.writeln('');
        if (currentLine.trim()) {
          // Simulate command execution
          handleCommand(terminal, currentLine.trim());
        }
        currentLine = '';
        terminal.write('$ ');
      }
      // Handle backspace
      else if (code === 127) {
        if (currentLine.length > 0) {
          currentLine = currentLine.slice(0, -1);
          terminal.write('\b \b');
        }
      }
      // Handle regular characters
      else if (code >= 32) {
        currentLine += data;
        terminal.write(data);
      }
    });

    const newTerminal: TerminalInstance = {
      id: terminalId,
      title: `Terminal ${terminals.length + 1}`,
      terminal,
      fitAddon,
    };

    setTerminals((prev) => [...prev, newTerminal]);
    setActiveTerminalId(terminalId);

    // Mount the terminal after state update
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

  // Simulate command execution
  const handleCommand = (terminal: any, command: string) => {
    const [cmd, ...args] = command.split(' ');

    switch (cmd.toLowerCase()) {
      case 'clear':
        terminal.clear();
        break;
      case 'help':
        terminal.writeln('Available commands:');
        terminal.writeln('  clear  - Clear the terminal');
        terminal.writeln('  help   - Show this help message');
        terminal.writeln('  echo   - Echo text back');
        terminal.writeln('  date   - Show current date and time');
        terminal.writeln('');
        break;
      case 'echo':
        terminal.writeln(args.join(' '));
        break;
      case 'date':
        terminal.writeln(new Date().toString());
        break;
      default:
        terminal.writeln(`Command not found: ${cmd}`);
        terminal.writeln(`Type 'help' for available commands.`);
        break;
    }
  };

  // Create initial terminal
  useEffect(() => {
    if (isVisible && terminals.length === 0 && Terminal && FitAddon) {
      createTerminal();
    }
  }, [isVisible, Terminal, FitAddon]);

  // Resize terminals when container size changes
  useEffect(() => {
    const handleResize = () => {
      terminals.forEach((t) => {
        try {
          t.fitAddon?.fit();
        } catch (e) {
          // Ignore resize errors
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
        const remainingTerminals = terminals.filter((t) => t.id !== id);
        setActiveTerminalId(remainingTerminals[0]?.id || null);
      }
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={`
        flex flex-col h-full
        ${theme === 'dark' ? 'bg-[#1e1e1e]' : 'bg-white'}
      `}
    >
      {/* Terminal tabs header */}
      <div
        className={`
          flex items-center justify-between border-b
          ${theme === 'dark' ? 'bg-[#252526] border-[#2d2d2d]' : 'bg-[#f3f3f3] border-[#e5e5e5]'}
        `}
      >
        {/* Main tabs */}
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

        {/* Actions */}
        <div className="flex items-center gap-1 px-2">
          {activeTab === 'terminal' && (
            <>
              <button
                onClick={createTerminal}
                title="New Terminal"
                className={`
                  p-1.5 rounded transition-colors
                  ${theme === 'dark'
                    ? 'hover:bg-[#2a2a2a] text-[#cccccc]'
                    : 'hover:bg-[#e8e8e8] text-[#1e1e1e]'
                  }
                `}
              >
                <VscAdd className="w-4 h-4" />
              </button>
              {terminals.length > 0 && (
                <button
                  onClick={() => activeTerminalId && closeTerminal(activeTerminalId)}
                  title="Kill Terminal"
                  className={`
                    p-1.5 rounded transition-colors
                    ${theme === 'dark'
                      ? 'hover:bg-[#2a2a2a] text-[#cccccc]'
                      : 'hover:bg-[#e8e8e8] text-[#1e1e1e]'
                    }
                  `}
                >
                  <VscTrash className="w-4 h-4" />
                </button>
              )}
            </>
          )}
          <button
            onClick={onClose}
            title="Close Panel"
            className={`
              p-1.5 rounded transition-colors
              ${theme === 'dark'
                ? 'hover:bg-[#2a2a2a] text-[#cccccc]'
                : 'hover:bg-[#e8e8e8] text-[#1e1e1e]'
              }
            `}
          >
            <VscClose className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Terminal instances tabs (for terminal tab only) */}
      {activeTab === 'terminal' && terminals.length > 0 && (
        <div
          className={`
            flex items-center gap-1 px-2 py-1 border-b
            ${theme === 'dark' ? 'bg-[#252526] border-[#2d2d2d]' : 'bg-[#f3f3f3] border-[#e5e5e5]'}
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
                    ? 'bg-[#1e1e1e] text-white'
                    : 'bg-white text-[#1e1e1e]'
                  : theme === 'dark'
                    ? 'text-[#858585] hover:bg-[#2a2a2a]'
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

      {/* Terminal content */}
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
                <p className="text-sm mb-4">No terminal instances</p>
                <button
                  onClick={createTerminal}
                  className={`
                    px-4 py-2 rounded text-sm
                    ${theme === 'dark'
                      ? 'bg-[#0e639c] hover:bg-[#1177bb] text-white'
                      : 'bg-[#0066b8] hover:bg-[#005a9e] text-white'
                    }
                  `}
                >
                  Create Terminal
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
            <p className="text-sm">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} panel (Coming soon)</p>
          </div>
        )}
      </div>
    </div>
  );
}

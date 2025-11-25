"use client";
import React, { useState } from 'react';
import { 
  VscSourceControl, 
  VscAdd, 
  VscRemove, 
  VscRefresh,
  VscGitCommit,
  VscGitPullRequest,
  VscCheck,
  VscClose
} from 'react-icons/vsc';
import { useTheme } from '@/contexts/ThemeContext';
import { useEditorStore } from '@/store/useEditorStore';

interface GitPanelProps {
  theme?: 'dark' | 'light';
}

export default function GitPanel({ theme: legacyTheme = 'dark' }: GitPanelProps) {
  const theme = useTheme();
  const { currentRepo } = useEditorStore();
  const [commitMessage, setCommitMessage] = useState('');
  const [changedFiles, setChangedFiles] = useState([
    { path: 'src/app/page.tsx', status: 'modified' },
    { path: 'src/components/Header.tsx', status: 'added' },
    { path: 'README.md', status: 'deleted' },
  ]);

  const handleCommit = () => {
    if (!commitMessage.trim()) {
      alert('Ingresa un mensaje de commit');
      return;
    }
    console.log('Committing:', commitMessage);
    setCommitMessage('');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'modified':
        return <span className="text-yellow-500">M</span>;
      case 'added':
        return <span className="text-green-500">A</span>;
      case 'deleted':
        return <span className="text-red-500">D</span>;
      default:
        return <span>?</span>;
    }
  };

  return (
    <div className="flex flex-col h-full" style={{ color: theme.colors.foreground }}>
      {/* Header */}
      <div className="p-3 border-b flex items-center justify-between" style={{ borderColor: theme.colors.borderColor }}>
        <div className="flex items-center gap-2">
          <VscSourceControl className="w-5 h-5" />
          <span className="text-sm font-semibold">Control de código fuente</span>
        </div>
        <button
          className="p-1 rounded hover:bg-white/10"
          title="Actualizar"
        >
          <VscRefresh className="w-4 h-4" />
        </button>
      </div>

      {currentRepo ? (
        <>
          {/* Repository Info */}
          <div className="p-3 border-b" style={{ borderColor: theme.colors.borderColor }}>
            <div className="flex items-center gap-2 text-sm">
              <VscGitCommit className="w-4 h-4" />
              <span style={{ color: theme.colors.foregroundMuted }}>
                {currentRepo.owner.login}/{currentRepo.name}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs mt-1" style={{ color: theme.colors.foregroundMuted }}>
              <span>Branch:</span>
              <span className="font-mono" style={{ color: theme.colors.accent }}>
                {currentRepo.default_branch}
              </span>
            </div>
          </div>

          {/* Commit Message */}
          <div className="p-3 border-b" style={{ borderColor: theme.colors.borderColor }}>
            <textarea
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              placeholder="Mensaje de commit..."
              className="w-full p-2 text-sm rounded border outline-none resize-none"
              rows={3}
              style={{
                backgroundColor: theme.colors.backgroundTertiary,
                borderColor: theme.colors.borderColor,
                color: theme.colors.foreground
              }}
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleCommit}
                disabled={!commitMessage.trim()}
                className="flex items-center gap-2 px-3 py-1.5 text-sm rounded disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: theme.colors.accent,
                  color: '#ffffff'
                }}
              >
                <VscCheck className="w-4 h-4" />
                Commit
              </button>
              <button
                className="flex items-center gap-2 px-3 py-1.5 text-sm rounded"
                style={{
                  backgroundColor: theme.colors.backgroundTertiary,
                  color: theme.colors.foreground
                }}
              >
                <VscGitPullRequest className="w-4 h-4" />
                Commit & Push
              </button>
            </div>
          </div>

          {/* Changed Files */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-3">
              <div className="text-xs font-semibold uppercase mb-2" style={{ color: theme.colors.foregroundMuted }}>
                Cambios ({changedFiles.length})
              </div>

              {changedFiles.length > 0 ? (
                <div className="space-y-1">
                  {changedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 rounded hover:bg-white/5 cursor-pointer group"
                    >
                      <span className="w-4 text-center font-mono text-xs font-semibold">
                        {getStatusIcon(file.status)}
                      </span>
                      <span className="flex-1 text-sm truncate" style={{ color: theme.colors.foreground }}>
                        {file.path}
                      </span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                        <button
                          className="p-1 rounded hover:bg-white/10"
                          title="Stage cambio"
                        >
                          <VscAdd className="w-3 h-3" />
                        </button>
                        <button
                          className="p-1 rounded hover:bg-white/10"
                          title="Descartar cambio"
                        >
                          <VscClose className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8" style={{ color: theme.colors.foregroundMuted }}>
                  <p className="text-sm">No hay cambios</p>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-full p-4 text-center" style={{ color: theme.colors.foregroundMuted }}>
          <VscSourceControl className="w-12 h-12 mb-4 opacity-50" />
          <p className="text-sm mb-2">No hay repositorio abierto</p>
          <p className="text-xs">Conecta un repositorio de GitHub para usar el control de versiones</p>
        </div>
      )}
    </div>
  );
}

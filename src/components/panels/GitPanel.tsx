'use client';

import React, { useState, useEffect } from 'react';
import {
  VscSourceControl,
  VscRefresh,
  VscCheck,
  VscAdd,
  VscRemove,
  VscDiffAdded,
  VscDiffModified,
  VscDiffRemoved,
  VscGitCommit,
  VscRepo,
} from 'react-icons/vsc';
import { useTheme } from '@/contexts/ThemeContext';
import { useEditorStore } from '@/store/useEditorStore';

interface GitChange {
  path: string;
  status: 'added' | 'modified' | 'deleted';
  staged: boolean;
}

interface GitPanelProps {
  theme?: 'dark' | 'light';
}

export default function GitPanel({ theme: legacyTheme = 'dark' }: GitPanelProps) {
  const { theme } = useTheme();
  const { currentRepo } = useEditorStore();

  const [changes, setChanges] = useState<GitChange[]>([]);
  const [commitMessage, setCommitMessage] = useState('');
  const [isCommitting, setIsCommitting] = useState(false);
  const [isPushing, setIsPushing] = useState(false);

  // Mock changes - In production, fetch from Git API
  useEffect(() => {
    // Simulate some changes
    setChanges([
      { path: 'src/components/Editor.tsx', status: 'modified', staged: false },
      { path: 'src/utils/helpers.ts', status: 'modified', staged: false },
      { path: 'README.md', status: 'modified', staged: false },
      { path: 'src/components/NewComponent.tsx', status: 'added', staged: false },
    ]);
  }, [currentRepo]);

  const stagedChanges = changes.filter((c) => c.staged);
  const unstagedChanges = changes.filter((c) => !c.staged);

  const handleStageChange = (path: string) => {
    setChanges(
      changes.map((c) => (c.path === path ? { ...c, staged: !c.staged } : c))
    );
  };

  const handleStageAll = () => {
    setChanges(changes.map((c) => ({ ...c, staged: true })));
  };

  const handleUnstageAll = () => {
    setChanges(changes.map((c) => ({ ...c, staged: false })));
  };

  const handleCommit = async () => {
    if (!commitMessage.trim() || stagedChanges.length === 0) return;

    setIsCommitting(true);
    try {
      // Simulate commit API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Remove staged changes after commit
      setChanges(changes.filter((c) => !c.staged));
      setCommitMessage('');
    } catch (error) {
      console.error('Commit error:', error);
    } finally {
      setIsCommitting(false);
    }
  };

  const handlePush = async () => {
    setIsPushing(true);
    try {
      // Simulate push API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
    } catch (error) {
      console.error('Push error:', error);
    } finally {
      setIsPushing(false);
    }
  };

  const getStatusIcon = (status: GitChange['status']) => {
    switch (status) {
      case 'added':
        return <VscDiffAdded className="w-4 h-4" style={{ color: theme.colors.success }} />;
      case 'modified':
        return <VscDiffModified className="w-4 h-4" style={{ color: theme.colors.warning }} />;
      case 'deleted':
        return <VscDiffRemoved className="w-4 h-4" style={{ color: theme.colors.error }} />;
    }
  };

  const renderChangesList = (changesList: GitChange[], title: string, showStageButton: boolean) => {
    if (changesList.length === 0) return null;

    return (
      <div className="mb-4">
        <div
          className="flex items-center justify-between px-3 py-2"
          style={{ color: theme.colors.foregroundSecondary }}
        >
          <span className="text-xs font-semibold uppercase tracking-wide">
            {title} ({changesList.length})
          </span>
          {showStageButton && (
            <button
              onClick={changesList[0].staged ? handleUnstageAll : handleStageAll}
              className="text-xs p-1 rounded transition-colors"
              style={{ color: theme.colors.accent }}
            >
              {changesList[0].staged ? 'Unstage All' : 'Stage All'}
            </button>
          )}
        </div>

        <div className="space-y-0.5">
          {changesList.map((change) => (
            <button
              key={change.path}
              onClick={() => handleStageChange(change.path)}
              className="w-full flex items-center gap-2 px-3 py-1.5 transition-colors text-left"
              style={{ color: theme.colors.foreground }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.colors.listHoverBackground;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {getStatusIcon(change.status)}
              <span className="text-sm truncate flex-1">{change.path}</span>
              {change.staged ? (
                <VscRemove className="w-4 h-4 flex-shrink-0" />
              ) : (
                <VscAdd className="w-4 h-4 flex-shrink-0" />
              )}
            </button>
          ))}
        </div>
      </div>
    );
  };

  if (!currentRepo) {
    return (
      <div
        className="flex flex-col items-center justify-center h-full p-8 text-center"
        style={{ color: theme.colors.foregroundMuted }}
      >
        <VscRepo className="w-12 h-12 mb-3 opacity-50" />
        <p className="text-sm">No repository connected</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2 border-b"
        style={{ borderColor: theme.colors.border }}
      >
        <div className="flex items-center gap-2">
          <VscSourceControl className="w-4 h-4" style={{ color: theme.colors.foreground }} />
          <span className="text-sm font-medium" style={{ color: theme.colors.foreground }}>
            {currentRepo.default_branch}
          </span>
        </div>
        <button
          onClick={() => {
            /* Refresh logic */
          }}
          className="p-1 rounded transition-colors"
          style={{ color: theme.colors.foregroundMuted }}
          title="Refresh"
        >
          <VscRefresh className="w-4 h-4" />
        </button>
      </div>

      {/* Commit Message Input */}
      {stagedChanges.length > 0 && (
        <div className="p-3 border-b" style={{ borderColor: theme.colors.border }}>
          <textarea
            value={commitMessage}
            onChange={(e) => setCommitMessage(e.target.value)}
            placeholder="Commit message (Ctrl+Enter to commit)"
            rows={3}
            className="w-full px-3 py-2 rounded border focus:outline-none focus:ring-2 text-sm resize-none"
            style={{
              backgroundColor: theme.colors.inputBackground,
              color: theme.colors.inputForeground,
              borderColor: theme.colors.inputBorder,
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) {
                handleCommit();
              }
            }}
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleCommit}
              disabled={isCommitting || !commitMessage.trim()}
              className="flex-1 px-3 py-1.5 rounded text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              style={{
                backgroundColor: theme.colors.buttonBackground,
                color: theme.colors.buttonForeground,
              }}
            >
              <VscGitCommit className="w-4 h-4" />
              {isCommitting ? 'Committing...' : 'Commit'}
            </button>
            <button
              onClick={handlePush}
              disabled={isPushing}
              className="px-3 py-1.5 rounded text-sm font-medium transition-colors disabled:opacity-50"
              style={{
                backgroundColor: theme.colors.backgroundTertiary,
                color: theme.colors.foregroundSecondary,
              }}
            >
              {isPushing ? 'Pushing...' : 'Push'}
            </button>
          </div>
        </div>
      )}

      {/* Changes List */}
      <div className="flex-1 overflow-y-auto py-2">
        {changes.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center h-full p-8 text-center"
            style={{ color: theme.colors.foregroundMuted }}
          >
            <VscCheck className="w-12 h-12 mb-3 opacity-50" />
            <p className="text-sm">No changes</p>
          </div>
        ) : (
          <>
            {renderChangesList(stagedChanges, 'Staged Changes', true)}
            {renderChangesList(unstagedChanges, 'Changes', true)}
          </>
        )}
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { VscChevronRight, VscChevronDown, VscNewFile, VscRefresh } from 'react-icons/vsc';
import { useEditorStore, GitHubFile } from '@/store/useEditorStore';
import { getFileIcon, getLanguageFromFileName } from '@/utils/fileIcons';
import ContextMenu from '../ContextMenu';
import { FileTreeNode } from '@/types/editor';

interface FileExplorerProps {
  theme?: 'dark' | 'light';
}

export default function FileExplorer({ theme = 'dark' }: FileExplorerProps) {
  const {
    currentRepo,
    repoFiles,
    repoFolders,
    isLoadingFiles,
    fetchRepoTree,
    fetchFileContent,
    openFile,
    createFile,
    deleteFile,
    renameFile,
  } = useEditorStore();

  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['root']));
  const [fileTree, setFileTree] = useState<FileTreeNode[]>([]);
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    position: { x: number; y: number };
    node?: FileTreeNode;
  }>({ visible: false, position: { x: 0, y: 0 } });

  // Modals
  const [createFileModal, setCreateFileModal] = useState<{
    visible: boolean;
    folderPath: string;
  }>({ visible: false, folderPath: '' });
  const [newFileName, setNewFileName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const [renameModal, setRenameModal] = useState<{
    visible: boolean;
    node?: FileTreeNode;
  }>({ visible: false });
  const [renameValue, setRenameValue] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);

  const [deleteModal, setDeleteModal] = useState<{
    visible: boolean;
    node?: FileTreeNode;
  }>({ visible: false });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (currentRepo) {
      fetchRepoTree(
        currentRepo.owner.login,
        currentRepo.name,
        currentRepo.default_branch
      );
    }
  }, [currentRepo]);

  useEffect(() => {
    if (repoFiles.length > 0 || repoFolders.length > 0) {
      const tree = buildFileTree(repoFiles, repoFolders);
      setFileTree(tree);
    }
  }, [repoFiles, repoFolders]);

  const buildFileTree = (
    files: GitHubFile[],
    folders: GitHubFile[]
  ): FileTreeNode[] => {
    const root: FileTreeNode[] = [];
    const pathMap = new Map<string, FileTreeNode>();

    folders.forEach((folder) => {
      const node: FileTreeNode = {
        name: folder.path.split('/').pop() || folder.path,
        path: folder.path,
        type: 'folder',
        children: [],
        sha: folder.sha,
      };
      pathMap.set(folder.path, node);
    });

    files.forEach((file) => {
      const node: FileTreeNode = {
        name: file.path.split('/').pop() || file.path,
        path: file.path,
        type: 'file',
        sha: file.sha,
        size: file.size,
      };
      pathMap.set(file.path, node);
    });

    pathMap.forEach((node) => {
      const parentPath = node.path.split('/').slice(0, -1).join('/');
      if (parentPath) {
        const parent = pathMap.get(parentPath);
        if (parent && parent.children) {
          parent.children.push(node);
        }
      } else {
        root.push(node);
      }
    });

    const sortNodes = (nodes: FileTreeNode[]) => {
      nodes.sort((a, b) => {
        if (a.type !== b.type) {
          return a.type === 'folder' ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      });
      nodes.forEach((node) => {
        if (node.children) {
          sortNodes(node.children);
        }
      });
    };

    sortNodes(root);
    return root;
  };

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const handleFileClick = async (node: FileTreeNode) => {
    if (!currentRepo) return;

    const fileContent = await fetchFileContent(
      currentRepo.owner.login,
      currentRepo.name,
      node.path
    );

    if (fileContent) {
      const language = getLanguageFromFileName(node.name);
      openFile({
        id: `github-${currentRepo.name}-${node.path}`,
        name: node.name,
        path: node.path,
        content: fileContent.content,
        language,
        lastModified: new Date(),
      });
    }
  };

  const showContextMenu = (e: React.MouseEvent, node: FileTreeNode) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      visible: true,
      position: { x: e.clientX, y: e.clientY },
      node,
    });
  };

  const handleRenameClick = (node: FileTreeNode) => {
    setRenameModal({ visible: true, node });
    setRenameValue(node.name);
    setContextMenu((prev) => ({ ...prev, visible: false }));
  };

  const handleDeleteClick = (node: FileTreeNode) => {
    setDeleteModal({ visible: true, node });
    setContextMenu((prev) => ({ ...prev, visible: false }));
  };

  const handleNewFileClick = (folderPath: string = '') => {
    setCreateFileModal({ visible: true, folderPath });
    setContextMenu((prev) => ({ ...prev, visible: false }));
  };

  const getContextOptions = (node: FileTreeNode) => {
    if (node.type === 'folder') {
      return [
        {
          label: '📄 New File',
          onClick: () => handleNewFileClick(node.path),
        },
        {
          label: '📋 Copy Path',
          onClick: () => {
            navigator.clipboard.writeText(node.path);
            setContextMenu((prev) => ({ ...prev, visible: false }));
          },
        },
      ];
    }

    return [
      {
        label: '✏️ Rename',
        onClick: () => handleRenameClick(node),
      },
      {
        label: '🗑️ Delete',
        onClick: () => handleDeleteClick(node),
      },
      {
        label: '📋 Copy Path',
        onClick: () => {
          navigator.clipboard.writeText(node.path);
          setContextMenu((prev) => ({ ...prev, visible: false }));
        },
      },
    ];
  };

  const handleCreateFile = async () => {
    if (!newFileName.trim() || !currentRepo) return;

    setIsCreating(true);
    try {
      await createFile(
        currentRepo.owner.login,
        currentRepo.name,
        createFileModal.folderPath,
        newFileName,
        currentRepo.default_branch
      );

      await fetchRepoTree(currentRepo.owner.login, currentRepo.name, currentRepo.default_branch);

      setCreateFileModal({ visible: false, folderPath: '' });
      setNewFileName('');
    } catch (error) {
      console.error('Error creating file:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleRenameFile = async () => {
    if (!renameValue.trim() || !renameModal.node || !currentRepo) return;

    const node = renameModal.node;
    const parentPath = node.path.split('/').slice(0, -1).join('/');
    const newPath = parentPath ? `${parentPath}/${renameValue}` : renameValue;

    setIsRenaming(true);
    try {
      await renameFile(
        currentRepo.owner.login,
        currentRepo.name,
        node.path,
        newPath,
        `Rename ${node.name} to ${renameValue}`,
        node.sha!,
        currentRepo.default_branch
      );

      setRenameModal({ visible: false });
      setRenameValue('');

      setTimeout(() => {
        fetchRepoTree(currentRepo.owner.login, currentRepo.name, currentRepo.default_branch);
      }, 800);
    } catch (error) {
      console.error('Error renaming file:', error);
    } finally {
      setIsRenaming(false);
    }
  };

  const handleDeleteFile = async () => {
    if (!deleteModal.node || !currentRepo) return;

    const node = deleteModal.node;
    setIsDeleting(true);

    try {
      await deleteFile(
        currentRepo.owner.login,
        currentRepo.name,
        node.path,
        `Delete ${node.name}`,
        node.sha!,
        currentRepo.default_branch
      );

      setDeleteModal({ visible: false });

      setTimeout(() => {
        fetchRepoTree(currentRepo.owner.login, currentRepo.name, currentRepo.default_branch);
      }, 800);
    } catch (error) {
      console.error('Error deleting file:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRefresh = () => {
    if (currentRepo) {
      fetchRepoTree(
        currentRepo.owner.login,
        currentRepo.name,
        currentRepo.default_branch
      );
    }
  };

  const renderNode = (node: FileTreeNode, depth = 0): React.ReactNode => {
    const isExpanded = expandedFolders.has(node.path);
    const paddingLeft = 8 + depth * 12;

    if (node.type === 'folder') {
      return (
        <div key={node.path}>
          <div
            onClick={() => toggleFolder(node.path)}
            onContextMenu={(e) => showContextMenu(e, node)}
            className={`
              flex items-center gap-1.5 px-2 py-1 cursor-pointer
              select-none transition-colors
              ${theme === 'dark'
                ? 'hover:bg-[#2a2a2a] text-[#cccccc]'
                : 'hover:bg-[#e8e8e8] text-[#1e1e1e]'
              }
            `}
            style={{ paddingLeft: `${paddingLeft}px` }}
          >
            {isExpanded ? (
              <VscChevronDown className="w-3 h-3 flex-shrink-0" />
            ) : (
              <VscChevronRight className="w-3 h-3 flex-shrink-0" />
            )}
            <div className="flex-shrink-0">
              {getFileIcon('folder', isExpanded)}
            </div>
            <span className="text-sm truncate">{node.name}</span>
          </div>
          {isExpanded && node.children && (
            <div>
              {node.children.map((child) => renderNode(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    return (
      <div
        key={node.path}
        onClick={() => handleFileClick(node)}
        onContextMenu={(e) => showContextMenu(e, node)}
        className={`
          flex items-center gap-1.5 px-2 py-1 cursor-pointer
          select-none transition-colors
          ${theme === 'dark'
            ? 'hover:bg-[#2a2a2a] text-[#cccccc]'
            : 'hover:bg-[#e8e8e8] text-[#1e1e1e]'
          }
        `}
        style={{ paddingLeft: `${paddingLeft + 16}px` }}
      >
        <div className="flex-shrink-0">
          {getFileIcon(node.name)}
        </div>
        <span className="text-sm truncate">{node.name}</span>
      </div>
    );
  };

  if (!currentRepo) {
    return (
      <div
        className={`
          flex flex-col items-center justify-center h-full p-4
          ${theme === 'dark' ? 'text-[#858585]' : 'text-[#6c6c6c]'}
        `}
      >
        <p className="text-xs text-center">No repository connected</p>
      </div>
    );
  }

  if (isLoadingFiles) {
    return (
      <div
        className={`
          flex items-center justify-center h-32
          ${theme === 'dark' ? 'text-[#858585]' : 'text-[#6c6c6c]'}
        `}
      >
        <div className="flex flex-col items-center gap-2">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <span className="text-xs">Loading files...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div
        className={`
          flex items-center justify-between px-3 py-2 border-b
          ${theme === 'dark' ? 'border-[#2d2d2d]' : 'border-[#e5e5e5]'}
        `}
      >
        <span
          className={`
            text-xs font-semibold uppercase tracking-wide
            ${theme === 'dark' ? 'text-[#858585]' : 'text-[#6c6c6c]'}
          `}
        >
          {currentRepo.name}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleNewFileClick('')}
            title="New File"
            className={`
              p-1 rounded transition-colors
              ${theme === 'dark'
                ? 'hover:bg-[#2a2a2a] text-[#cccccc]'
                : 'hover:bg-[#e8e8e8] text-[#1e1e1e]'
              }
            `}
          >
            <VscNewFile className="w-4 h-4" />
          </button>
          <button
            onClick={handleRefresh}
            title="Refresh"
            className={`
              p-1 rounded transition-colors
              ${theme === 'dark'
                ? 'hover:bg-[#2a2a2a] text-[#cccccc]'
                : 'hover:bg-[#e8e8e8] text-[#1e1e1e]'
              }
            `}
          >
            <VscRefresh className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* File tree */}
      <div className="overflow-y-auto flex-1">
        {fileTree.length === 0 ? (
          <div
            className={`
              flex flex-col items-center justify-center p-4
              ${theme === 'dark' ? 'text-[#858585]' : 'text-[#6c6c6c]'}
            `}
          >
            <p className="text-xs mb-3">No files found</p>
            <button
              onClick={() => handleNewFileClick('')}
              className={`
                text-xs px-3 py-1.5 rounded
                ${theme === 'dark'
                  ? 'bg-[#0e639c] hover:bg-[#1177bb] text-white'
                  : 'bg-[#0066b8] hover:bg-[#005a9e] text-white'
                }
              `}
            >
              Create File
            </button>
          </div>
        ) : (
          <div className="py-1">
            {fileTree.map((node) => renderNode(node))}
          </div>
        )}
      </div>

      {/* Context Menu */}
      <ContextMenu
        visible={contextMenu.visible}
        position={contextMenu.position}
        options={contextMenu.node ? getContextOptions(contextMenu.node) : []}
        onClose={() => setContextMenu((prev) => ({ ...prev, visible: false }))}
      />

      {/* Modals */}
      {createFileModal.visible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div
            className={`
              w-full max-w-md rounded-lg p-6
              ${theme === 'dark'
                ? 'bg-[#252526] border border-[#2d2d2d]'
                : 'bg-white border border-[#e5e5e5]'
              }
            `}
          >
            <h2
              className={`
                text-lg font-semibold mb-4
                ${theme === 'dark' ? 'text-white' : 'text-[#1e1e1e]'}
              `}
            >
              New File
            </h2>
            <input
              type="text"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateFile()}
              placeholder="filename.ext"
              autoFocus
              className={`
                w-full px-3 py-2 rounded border mb-4
                ${theme === 'dark'
                  ? 'bg-[#3c3c3c] border-[#2d2d2d] text-white'
                  : 'bg-white border-[#e5e5e5] text-[#1e1e1e]'
                }
              `}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setCreateFileModal({ visible: false, folderPath: '' });
                  setNewFileName('');
                }}
                className={`
                  px-4 py-2 rounded text-sm
                  ${theme === 'dark'
                    ? 'bg-[#3c3c3c] hover:bg-[#4c4c4c] text-white'
                    : 'bg-[#e8e8e8] hover:bg-[#d0d0d0] text-[#1e1e1e]'
                  }
                `}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFile}
                disabled={isCreating || !newFileName.trim()}
                className={`
                  px-4 py-2 rounded text-sm
                  ${theme === 'dark'
                    ? 'bg-[#0e639c] hover:bg-[#1177bb] text-white'
                    : 'bg-[#0066b8] hover:bg-[#005a9e] text-white'
                  }
                  disabled:opacity-50
                `}
              >
                {isCreating ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {renameModal.visible && renameModal.node && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div
            className={`
              w-full max-w-md rounded-lg p-6
              ${theme === 'dark'
                ? 'bg-[#252526] border border-[#2d2d2d]'
                : 'bg-white border border-[#e5e5e5]'
              }
            `}
          >
            <h2
              className={`
                text-lg font-semibold mb-4
                ${theme === 'dark' ? 'text-white' : 'text-[#1e1e1e]'}
              `}
            >
              Rename File
            </h2>
            <input
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRenameFile()}
              autoFocus
              className={`
                w-full px-3 py-2 rounded border mb-4
                ${theme === 'dark'
                  ? 'bg-[#3c3c3c] border-[#2d2d2d] text-white'
                  : 'bg-white border-[#e5e5e5] text-[#1e1e1e]'
                }
              `}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setRenameModal({ visible: false });
                  setRenameValue('');
                }}
                className={`
                  px-4 py-2 rounded text-sm
                  ${theme === 'dark'
                    ? 'bg-[#3c3c3c] hover:bg-[#4c4c4c] text-white'
                    : 'bg-[#e8e8e8] hover:bg-[#d0d0d0] text-[#1e1e1e]'
                  }
                `}
              >
                Cancel
              </button>
              <button
                onClick={handleRenameFile}
                disabled={isRenaming || !renameValue.trim()}
                className={`
                  px-4 py-2 rounded text-sm
                  ${theme === 'dark'
                    ? 'bg-[#0e639c] hover:bg-[#1177bb] text-white'
                    : 'bg-[#0066b8] hover:bg-[#005a9e] text-white'
                  }
                  disabled:opacity-50
                `}
              >
                {isRenaming ? 'Renaming...' : 'Rename'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteModal.visible && deleteModal.node && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div
            className={`
              w-full max-w-md rounded-lg p-6
              ${theme === 'dark'
                ? 'bg-[#252526] border border-red-500/50'
                : 'bg-white border border-red-500/50'
              }
            `}
          >
            <h2 className="text-lg font-semibold mb-4 text-red-500">
              Delete File
            </h2>
            <p
              className={`
                mb-4 text-sm
                ${theme === 'dark' ? 'text-[#cccccc]' : 'text-[#1e1e1e]'}
              `}
            >
              Are you sure you want to delete <strong>{deleteModal.node.name}</strong>?
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteModal({ visible: false })}
                className={`
                  px-4 py-2 rounded text-sm
                  ${theme === 'dark'
                    ? 'bg-[#3c3c3c] hover:bg-[#4c4c4c] text-white'
                    : 'bg-[#e8e8e8] hover:bg-[#d0d0d0] text-[#1e1e1e]'
                  }
                `}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteFile}
                disabled={isDeleting}
                className="px-4 py-2 rounded text-sm bg-red-500 hover:bg-red-600 text-white disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

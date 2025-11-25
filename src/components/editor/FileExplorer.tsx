"use client";

import React, { useEffect, useRef, useState } from 'react';
import {
  VscChevronRight,
  VscChevronDown,
  VscFolder,
  VscFolderOpened,
  VscRefresh,
  VscNewFile
} from 'react-icons/vsc';
import { useEditorStore, type FileItem } from '@/store/useEditorStore';
import { useTheme } from '@/contexts/ThemeContext';
import ContextMenu from './ContextMenu';

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  sha?: string;
  children?: FileNode[];
}

interface FileExplorerProps {
  theme?: 'dark' | 'light';
  onCreateProject: () => void;
}

export default function FileExplorer({ theme: legacyTheme = 'dark', onCreateProject }: FileExplorerProps) {
  const theme = useTheme();
  const {
    repoFiles,
    repoFolders,
    currentRepo,
    openFile,
    workspaceFiles,
    workspaceName,
    addFile,
    fetchFileContent,
    fetchRepoTree,
    deleteRepoFile,
    renameRepoFile,
    createFile,
    renameFile,
    deleteFile
  } = useEditorStore();

  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['/']));
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; item: FileNode } | null>(null);
  const [isRenaming, setIsRenaming] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const renameInputRef = useRef<HTMLInputElement | null>(null);
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [showNewFileInput, setShowNewFileInput] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<FileNode | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const hasLocalWorkspace = workspaceFiles.length > 0;

  // Seleccionar automáticamente el nombre al renombrar
  useEffect(() => {
    if (isRenaming && renameInputRef.current) {
      renameInputRef.current.select();
    }
  }, [isRenaming]);

  // Cargar árbol del repositorio
  useEffect(() => {
    if (!currentRepo) return;

    fetchRepoTree(currentRepo.owner.login, currentRepo.name, currentRepo.default_branch);
    setExpandedFolders(new Set(['/']));
  }, [currentRepo, fetchRepoTree]);

  // Construir árbol anidado para repositorios o proyectos locales
  useEffect(() => {
    if (currentRepo) {
      if (!repoFiles || repoFiles.length === 0) {
        setFileTree([]);
        return;
      }

      const tree: FileNode[] = [];
      const folderMap = new Map<string, FileNode>();

      repoFolders?.forEach((folder) => {
        const parts = folder.path.split('/').filter(Boolean);
        let currentPath = '';

        parts.forEach((part, index) => {
          const previousPath = currentPath;
          currentPath = currentPath ? `${currentPath}/${part}` : part;

          if (!folderMap.has(currentPath)) {
            const folderNode: FileNode = {
              name: part,
              path: currentPath,
              type: 'folder',
              children: []
            };

            folderMap.set(currentPath, folderNode);

            if (index === 0) {
              tree.push(folderNode);
            } else if (folderMap.has(previousPath)) {
              folderMap.get(previousPath)!.children!.push(folderNode);
            }
          }
        });
      });

      repoFiles.forEach((file) => {
        const parts = file.path.split('/').filter(Boolean);
        const fileName = parts[parts.length - 1];
        const folderPath = parts.slice(0, -1).join('/');

        const fileNode: FileNode = {
          name: fileName,
          path: file.path,
          type: 'file',
          sha: file.sha
        };

        if (folderPath && folderMap.has(folderPath)) {
          folderMap.get(folderPath)!.children!.push(fileNode);
        } else if (!folderPath) {
          tree.push(fileNode);
        }
      });

      setFileTree(tree);
      return;
    }

    if (!hasLocalWorkspace) {
      setFileTree([]);
      return;
    }

    const tree: FileNode[] = [];
    const folderMap = new Map<string, FileNode>();

    workspaceFiles.forEach((file: FileItem) => {
      const parts = file.path.split('/').filter(Boolean);
      const fileName = parts[parts.length - 1];
      const folderPath = parts.slice(0, -1).join('/');

      if (folderPath) {
        const folders = folderPath.split('/');
        let currentPath = '';

        folders.forEach((part, index) => {
          const previousPath = currentPath;
          currentPath = currentPath ? `${currentPath}/${part}` : part;

          if (!folderMap.has(currentPath)) {
            const folderNode: FileNode = {
              name: part,
              path: currentPath,
              type: 'folder',
              children: []
            };

            folderMap.set(currentPath, folderNode);

            if (index === 0) {
              tree.push(folderNode);
            } else if (folderMap.has(previousPath)) {
              folderMap.get(previousPath)!.children!.push(folderNode);
            }
          }
        });
      }

      const fileNode: FileNode = {
        name: fileName,
        path: file.path,
        type: 'file'
      };

      if (folderPath && folderMap.has(folderPath)) {
        folderMap.get(folderPath)!.children!.push(fileNode);
      } else if (!folderPath) {
        tree.push(fileNode);
      }
    });

    setFileTree(tree);
  }, [currentRepo, repoFiles, repoFolders, hasLocalWorkspace, workspaceFiles]);

  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  };

  const handleFileClick = async (file: FileNode) => {
    if (currentRepo) {
      const content = await fetchFileContent(currentRepo.owner.login, currentRepo.name, file.path);

      if (content) {
        openFile({
          id: `github-${file.path}`,
          name: file.name,
          path: file.path,
          content: content.content,
          language: getLanguageFromFileName(file.name),
          lastModified: new Date(),
          isDirty: false,
        });
      }
      return;
    }

    const localFile = workspaceFiles.find((f) => f.path === file.path);
    if (localFile) {
      openFile(localFile);
    }
  };

  const handleContextMenu = (e: React.MouseEvent, item: FileNode) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, item });
  };

  const handleRename = (item: FileNode) => {
    setIsRenaming(item.path);
    setRenameValue(item.name);
    setContextMenu(null);
  };

  const handleDelete = (item: FileNode) => {
    setDeleteTarget(item);
    setShowDeleteModal(true);
    setContextMenu(null);
  };

  const handleRenameSubmit = async () => {
    if (!isRenaming || !renameValue.trim()) {
      setIsRenaming(null);
      setRenameValue('');
      return;
    }

    const item = findNodeByPath(fileTree, isRenaming);
    if (!item) {
      setIsRenaming(null);
      return;
    }

    if (currentRepo && item.sha) {
      const newPath = item.path.replace(item.name, renameValue.trim());

      const success = await renameRepoFile(
        currentRepo.owner.login,
        currentRepo.name,
        item.path,
        newPath,
        `Rename ${item.name} to ${renameValue}`,
        item.sha,
        currentRepo.default_branch
      );

      if (success) {
        renameFile(`github-${item.path}`, renameValue.trim());
        await fetchRepoTree(currentRepo.owner.login, currentRepo.name, currentRepo.default_branch);
      }

      setIsRenaming(null);
      setRenameValue('');
      return;
    }

    renameFile(`local-${item.path}`, renameValue.trim());
    setIsRenaming(null);
    setRenameValue('');
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    if (currentRepo && deleteTarget.sha && currentRepo.owner) {
      const success = await deleteRepoFile(
        currentRepo.owner.login,
        currentRepo.name,
        deleteTarget.path,
        `Delete ${deleteTarget.name}`,
        deleteTarget.sha,
        currentRepo.default_branch
      );

      if (!success) {
        setShowDeleteModal(false);
        return;
      }

      deleteFile(`github-${deleteTarget.path}`);
      await fetchRepoTree(currentRepo.owner.login, currentRepo.name, currentRepo.default_branch);
      setShowDeleteModal(false);
      setDeleteTarget(null);
      return;
    }

    deleteFile(`local-${deleteTarget.path}`);
    setShowDeleteModal(false);
    setDeleteTarget(null);
  };

  const findNodeByPath = (nodes: FileNode[], path: string): FileNode | null => {
    for (const node of nodes) {
      if (node.path === path) return node;
      if (node.children) {
        const found = findNodeByPath(node.children, path);
        if (found) return found;
      }
    }
    return null;
  };

  const getLanguageFromFileName = (fileName: string): string => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const langMap: Record<string, string> = {
      'js': 'javascript',
      'ts': 'typescript',
      'jsx': 'javascript',
      'tsx': 'typescript',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'cs': 'csharp',
      'go': 'go',
      'rs': 'rust',
      'php': 'php',
      'rb': 'ruby',
      'html': 'html',
      'css': 'css',
      'json': 'json',
      'md': 'markdown',
      'sh': 'shell',
    };
    return langMap[ext || ''] || 'plaintext';
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();

    const iconMap: Record<string, string> = {
      'js': '📜',
      'ts': '🔷',
      'jsx': '⚛️',
      'tsx': '⚛️',
      'py': '🐍',
      'java': '☕',
      'html': '🌐',
      'css': '🎨',
      'json': '📋',
      'md': '📝',
      'xml': '📄',
      'yml': '⚙️',
      'yaml': '⚙️',
      'sh': '🖥️',
      'bat': '🖥️',
      'git': '🌿',
      'png': '🖼️',
      'jpg': '🖼️',
      'svg': '🎨',
    };

    return iconMap[ext || ''] || '📄';
  };

  const renderTree = (nodes: FileNode[], level: number = 0) => {
    return nodes.map((node) => (
      <div key={node.path}>
        <div
          className="flex items-center gap-1 px-2 py-1 text-sm cursor-pointer hover:bg-white/5 group"
          style={{ paddingLeft: `${level * 12 + 8}px` }}
          onClick={() => node.type === 'folder' ? toggleFolder(node.path) : handleFileClick(node)}
          onContextMenu={(e) => handleContextMenu(e, node)}
        >
          {node.type === 'folder' && (
            expandedFolders.has(node.path)
              ? <VscChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: theme.colors.foregroundMuted }} />
              : <VscChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: theme.colors.foregroundMuted }} />
          )}

          {node.type === 'folder' ? (
            expandedFolders.has(node.path)
              ? <VscFolderOpened className="w-4 h-4 flex-shrink-0" style={{ color: theme.colors.foreground }} />
              : <VscFolder className="w-4 h-4 flex-shrink-0" style={{ color: theme.colors.foreground }} />
          ) : (
            <span className="text-base flex-shrink-0">{getFileIcon(node.name)}</span>
          )}

          {isRenaming === node.path ? (
            <input
              ref={renameInputRef}
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onBlur={() => setIsRenaming(null)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRenameSubmit();
                if (e.key === 'Escape') setIsRenaming(null);
              }}
              className="flex-1 bg-transparent border-none outline-none text-sm"
              style={{ color: theme.colors.foreground }}
              autoFocus
            />
          ) : (
            <span
              className="flex-1 truncate"
              style={{ color: theme.colors.foreground }}
            >
              {node.name}
            </span>
          )}
        </div>

        {node.type === 'folder' && expandedFolders.has(node.path) && node.children && (
          renderTree(node.children, level + 1)
        )}
      </div>
    ));
  };

  const refreshTree = async () => {
    if (currentRepo) {
      await fetchRepoTree(currentRepo.owner.login, currentRepo.name, currentRepo.default_branch);
    }
  };

  const handleCreateFile = async () => {
    if (!newFileName.trim()) return;

    if (currentRepo) {
      setIsCreatingFile(true);
      try {
        await createFile(
          currentRepo.owner.login,
          currentRepo.name,
          '',
          newFileName.trim(),
          currentRepo.default_branch
        );

        setNewFileName('');
        setShowNewFileInput(false);
        await fetchRepoTree(currentRepo.owner.login, currentRepo.name, currentRepo.default_branch);
      } finally {
        setIsCreatingFile(false);
      }
      return;
    }

    const path = newFileName.trim();
    const nameOnly = path.split('/').pop() || path;
    const file: FileItem = {
      id: `local-${path}`,
      name: nameOnly,
      path,
      content: '',
      language: getLanguageFromFileName(nameOnly),
      lastModified: new Date(),
      isDirty: false,
    };
    addFile(file);
    setNewFileName('');
    setShowNewFileInput(false);
  };

  if (!currentRepo && !hasLocalWorkspace) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center" style={{ color: theme.colors.foregroundMuted }}>
        <p className="text-sm mb-4">No hay repositorio conectado</p>
        <p className="text-xs">Conecta GitHub o crea un proyecto para comenzar</p>
      </div>
    );
  }

  const title = currentRepo ? currentRepo.name : workspaceName || 'Proyecto local';

  return (
    <div className="flex flex-col h-full">
      {/* Barra de acciones */}
      <div className="flex items-center justify-between px-2 py-1 border-b" style={{ borderColor: theme.colors.sidebarBorder }}>
        <span className="text-xs font-medium" style={{ color: theme.colors.foregroundMuted }}>
          {title}
        </span>
        <div className="flex gap-1 items-center">
          <button
            onClick={onCreateProject}
            className="px-2 py-1 text-[11px] rounded hover:bg-white/10"
            title="Crear proyecto"
            aria-label="Abrir asistente de proyectos"
          >
            ➕ Crear Proyecto
          </button>
          <button
            onClick={() => setShowNewFileInput((prev) => !prev)}
            className="p-1 rounded hover:bg-white/10"
            title="Nuevo archivo"
            aria-label="Crear archivo"
          >
            <VscNewFile className="w-4 h-4" style={{ color: theme.colors.foreground }} />
          </button>
          {currentRepo && (
            <button
              onClick={refreshTree}
              className="p-1 rounded hover:bg-white/10"
              title="Actualizar"
              aria-label="Actualizar árbol"
            >
              <VscRefresh className="w-4 h-4" style={{ color: theme.colors.foreground }} />
            </button>
          )}
        </div>
      </div>

      {/* Árbol de archivos - FIXED WITH SCROLL */}
      <div className="flex-1 overflow-y-auto scrollbar-hide" style={{ maxHeight: 'calc(100vh - 200px)' }}>
        {showNewFileInput && (
          <div className="px-2 py-2 border-b" style={{ borderColor: theme.colors.sidebarBorder }}>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateFile();
                  if (e.key === 'Escape') setShowNewFileInput(false);
                }}
                placeholder="Nombre del archivo"
                className="flex-1 px-2 py-1 text-sm rounded border outline-none"
                style={{
                  backgroundColor: theme.colors.backgroundTertiary,
                  borderColor: theme.colors.sidebarBorder,
                  color: theme.colors.foreground,
                }}
                autoFocus
              />
              <button
                onClick={handleCreateFile}
                disabled={isCreatingFile || !newFileName.trim()}
                className="px-2 py-1 text-xs rounded disabled:opacity-50"
                style={{
                  backgroundColor: theme.colors.accent,
                  color: '#ffffff',
                }}
              >
                {isCreatingFile ? 'Creando...' : 'Crear'}
              </button>
              <button
                onClick={() => {
                  setShowNewFileInput(false);
                  setNewFileName('');
                }}
                className="px-2 py-1 text-xs rounded"
                style={{
                  backgroundColor: theme.colors.backgroundTertiary,
                  color: theme.colors.foreground,
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {fileTree.length > 0 ? (
          renderTree(fileTree)
        ) : (
          <div className="p-4 text-center" style={{ color: theme.colors.foregroundMuted }}>
            <p className="text-sm">El espacio está vacío</p>
          </div>
        )}
      </div>

      {/* Menú contextual */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          items={[
            {
              label: 'Renombrar',
              onClick: () => handleRename(contextMenu.item)
            },
            {
              label: 'Eliminar',
              onClick: () => handleDelete(contextMenu.item),
              danger: true
            }
          ]}
        />
      )}

      {/* Modal de confirmación de borrado */}
      {showDeleteModal && deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div
            className="w-full max-w-sm rounded-lg p-5 shadow-xl"
            style={{ backgroundColor: theme.colors.background, border: `1px solid ${theme.colors.borderColor}` }}
          >
            <h3 className="text-lg font-semibold mb-2" style={{ color: theme.colors.foreground }}>
              Confirmar eliminación
            </h3>
            <p className="text-sm mb-4" style={{ color: theme.colors.foregroundMuted }}>
              ¿Eliminar {deleteTarget.name}? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-2 text-sm">
              <button
                className="px-3 py-2 rounded"
                style={{ backgroundColor: theme.colors.backgroundTertiary, color: theme.colors.foreground }}
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteTarget(null);
                }}
              >
                Cancelar
              </button>
              <button
                className="px-3 py-2 rounded text-white"
                style={{ backgroundColor: '#b91c1c' }}
                onClick={confirmDelete}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

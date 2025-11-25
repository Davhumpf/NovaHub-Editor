"use client";
import React, { useState, useEffect } from 'react';
import { 
  VscChevronRight, 
  VscChevronDown, 
  VscFile,
  VscFolder,
  VscFolderOpened,
  VscRefresh,
  VscNewFile
} from 'react-icons/vsc';
import { useEditorStore } from '@/store/useEditorStore';
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
}

export default function FileExplorer({ theme: legacyTheme = 'dark' }: FileExplorerProps) {
  const theme = useTheme();
  const { 
    repoFiles, 
    repoFolders, 
    currentRepo, 
    openFile, 
    fetchFileContent,
    fetchRepoTree,
    deleteFile,
    renameFile,
    createFile
  } = useEditorStore();

  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['/']));
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; item: FileNode } | null>(null);
  const [isRenaming, setIsRenaming] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [showNewFileInput, setShowNewFileInput] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [isCreatingFile, setIsCreatingFile] = useState(false);

  // Load the selected repository tree automatically
  useEffect(() => {
    if (!currentRepo) return;

    fetchRepoTree(currentRepo.owner.login, currentRepo.name, currentRepo.default_branch);
    setExpandedFolders(new Set(['/']));
  }, [currentRepo, fetchRepoTree]);

  // Build file tree from flat file list
  useEffect(() => {
    if (!repoFiles || repoFiles.length === 0) return;

    const tree: FileNode[] = [];
    const folderMap = new Map<string, FileNode>();

    // Add folders first
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

    // Add files
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
  }, [repoFiles, repoFolders]);

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
    if (!currentRepo) return;

    const content = await fetchFileContent(
      currentRepo.owner.login,
      currentRepo.name,
      file.path
    );

    if (content) {
      openFile({
        id: `github-${file.path}`,
        name: file.name,
        path: file.path,
        content: content.content,
        language: getLanguageFromFileName(file.name),
        lastModified: new Date(),
      });
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

  const handleDelete = async (item: FileNode) => {
    if (!currentRepo || !item.sha) return;
    
    const confirmed = confirm(`¿Eliminar ${item.name}?`);
    if (!confirmed) return;

    const success = await deleteFile(
      currentRepo.owner.login,
      currentRepo.name,
      item.path,
      `Delete ${item.name}`,
      item.sha,
      currentRepo.default_branch
    );

    if (success) {
      // Refresh tree
      await fetchRepoTree(currentRepo.owner.login, currentRepo.name, currentRepo.default_branch);
    }
    
    setContextMenu(null);
  };

  const handleRenameSubmit = async () => {
    if (!isRenaming || !currentRepo) return;

    const item = findNodeByPath(fileTree, isRenaming);
    if (!item || !item.sha) return;

    const newPath = item.path.replace(item.name, renameValue);

    const success = await renameFile(
      currentRepo.owner.login,
      currentRepo.name,
      item.path,
      newPath,
      `Rename ${item.name} to ${renameValue}`,
      item.sha,
      currentRepo.default_branch
    );

    if (success) {
      await fetchRepoTree(currentRepo.owner.login, currentRepo.name, currentRepo.default_branch);
    }

    setIsRenaming(null);
    setRenameValue('');
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
    
    // Iconos por extensión
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
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onBlur={handleRenameSubmit}
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
    if (!currentRepo) return;
    await fetchRepoTree(currentRepo.owner.login, currentRepo.name, currentRepo.default_branch);
  };

  const handleCreateFile = async () => {
    if (!currentRepo || !newFileName.trim()) return;

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
  };

  if (!currentRepo) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center" style={{ color: theme.colors.foregroundMuted }}>
        <p className="text-sm mb-4">No hay repositorio conectado</p>
        <p className="text-xs">Conecta un repositorio de GitHub para comenzar</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-2 py-1 border-b" style={{ borderColor: theme.colors.sidebarBorder }}>
        <span className="text-xs font-medium" style={{ color: theme.colors.foregroundMuted }}>
          {currentRepo.name}
        </span>
        <div className="flex gap-1">
          <button
            onClick={() => setShowNewFileInput((prev) => !prev)}
            className="p-1 rounded hover:bg-white/10"
            title="Nuevo archivo"
          >
            <VscNewFile className="w-4 h-4" style={{ color: theme.colors.foreground }} />
          </button>
          <button
            onClick={refreshTree}
            className="p-1 rounded hover:bg-white/10"
            title="Actualizar"
          >
            <VscRefresh className="w-4 h-4" style={{ color: theme.colors.foreground }} />
          </button>
        </div>
      </div>

      {/* File Tree */}
      <div className="flex-1 overflow-y-auto">
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
            <p className="text-sm">El repositorio está vacío</p>
          </div>
        )}
      </div>

      {/* Context Menu */}
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
    </div>
  );
}

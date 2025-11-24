'use client';

import { useState, useEffect } from 'react';
import { useEditorStore, GitHubFile } from '@/store/useEditorStore';
import { getFileIcon } from '@/utils/fileIcons';
import ContextMenu from './ContextMenu';

interface FileTreeNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: FileTreeNode[];
  sha?: string;
  size?: number;
}

export default function FileTree() {
  const {
    currentRepo,
    repoFiles,
    repoFolders,
    isLoadingFiles,
    fetchRepoTree,
    fetchFileContent,
    openFile,
  } = useEditorStore();

  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [fileTree, setFileTree] = useState<FileTreeNode[]>([]);
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    position: { x: number; y: number };
    node?: FileTreeNode;
  }>({ visible: false, position: { x: 0, y: 0 } });

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

  const getLanguageFromFileName = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const langMap: { [key: string]: string } = {
      js: 'javascript',
      ts: 'typescript',
      jsx: 'javascript',
      tsx: 'typescript',
      py: 'python',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      cs: 'csharp',
      go: 'go',
      rs: 'rust',
      php: 'php',
      rb: 'ruby',
      html: 'html',
      css: 'css',
      scss: 'scss',
      sass: 'sass',
      json: 'json',
      xml: 'xml',
      yaml: 'yaml',
      yml: 'yaml',
      md: 'markdown',
      sh: 'shell',
      bash: 'shell',
      sql: 'sql',
      graphql: 'graphql',
      gql: 'graphql',
    };
    return langMap[ext || ''] || 'plaintext';
  };

  const showContextMenu = (e: React.MouseEvent, node: FileTreeNode) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      position: { x: e.clientX, y: e.clientY },
      node,
    });
  };

  const getContextOptions = (node: FileTreeNode) => {
    const items = [
      {
        label: 'Renombrar',
        onClick: () => alert(`Renombrar ${node.name}`),
      },
      {
        label: node.type === 'folder' ? 'Nuevo archivo' : 'Eliminar',
        onClick: () =>
          alert(
            node.type === 'folder'
              ? `Crear archivo dentro de ${node.name}`
              : `Eliminar ${node.name}`
          ),
      },
      {
        label: 'Copiar ruta',
        onClick: () => navigator.clipboard.writeText(node.path),
      },
    ];
    return items;
  };

  const renderNode = (node: FileTreeNode, depth = 0, isLast = false) => {
    const isExpanded = expandedFolders.has(node.path);
    const indent = depth * 20;
    const indentGuides = [];
    for (let i = 0; i < depth; i++) {
      indentGuides.push(
        <div
          key={`guide-${i}`}
          className="absolute h-full w-px bg-zinc-700/50"
          style={{ left: `${8 + i * 20}px` }}
        />
      );
    }

    if (node.type === 'folder') {
      return (
        <div key={node.path}>
          <div className="relative">
            {indentGuides}
            {depth > 0 && (
              <div
                className="absolute h-px w-3 bg-zinc-700/50"
                style={{
                  left: `${8 + (depth - 1) * 20}px`,
                  top: '50%',
                }}
              />
            )}
            <button
              onClick={() => toggleFolder(node.path)}
              onContextMenu={(e) => showContextMenu(e, node)}
              className="relative flex w-full items-center gap-2 px-2 py-1 text-left text-sm hover:bg-zinc-800"
              style={{ paddingLeft: `${indent + 8}px` }}
            >
              <span className="text-zinc-400">{isExpanded ? '▼' : '▶'}</span>
              <span className="text-zinc-400">{isExpanded ? '📂' : '📁'}</span>
              <span className="truncate text-zinc-300">{node.name}</span>
            </button>
          </div>
          {isExpanded && node.children && (
            <div>
              {node.children.map((child, index) =>
                renderNode(child, depth + 1, index === node.children!.length - 1)
              )}
            </div>
          )}
        </div>
      );
    }

    const ext = node.name.split('.').pop()?.toLowerCase() || '';
    return (
      <div key={node.path} className="relative">
        {indentGuides}
        {depth > 0 && (
          <div
            className="absolute h-px w-3 bg-zinc-700/50"
            style={{
              left: `${8 + (depth - 1) * 20}px`,
              top: '50%',
            }}
          />
        )}
        <button
          onClick={() => handleFileClick(node)}
          onContextMenu={(e) => showContextMenu(e, node)}
          className="relative flex w-full items-center gap-2 px-2 py-1 text-left text-sm hover:bg-zinc-800"
          style={{ paddingLeft: `${indent + 8}px` }}
        >
          {getFileIcon(ext)}
          <span className="truncate text-zinc-300">{node.name}</span>
        </button>
      </div>
    );
  };

  if (!currentRepo) {
    return (
      <div className="p-4 text-center text-xs text-zinc-500">
        Conecta un repositorio para ver archivos
      </div>
    );
  }

  if (isLoadingFiles) {
    return (
      <div className="p-4 text-center text-xs text-zinc-400">
        Cargando archivos...
      </div>
    );
  }

  if (fileTree.length === 0) {
    return (
      <div className="p-4 text-center text-xs text-zinc-500">
        No se encontraron archivos
      </div>
    );
  }

  return (
    <>
      <div className="file-tree-container overflow-y-auto" style={{ maxHeight: '80vh' }}>
        <div className="space-y-0.5 p-2">
          {fileTree.map((node) => renderNode(node))}
        </div>
      </div>
      <ContextMenu
        visible={contextMenu.visible}
        position={contextMenu.position}
        options={contextMenu.node ? getContextOptions(contextMenu.node) : []}
        onClose={() => setContextMenu((prev) => ({ ...prev, visible: false }))}
      />
    </>
  );
}

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
    createFile,
    deleteFile,
    renameFile,
  } = useEditorStore();

  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [fileTree, setFileTree] = useState<FileTreeNode[]>([]);
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    position: { x: number; y: number };
    node?: FileTreeNode;
  }>({ visible: false, position: { x: 0, y: 0 } });

  // Modal para crear archivo
  const [createFileModal, setCreateFileModal] = useState<{
    visible: boolean;
    folderPath: string;
  }>({ visible: false, folderPath: '' });
  const [newFileName, setNewFileName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Modal para renombrar
  const [renameModal, setRenameModal] = useState<{
    visible: boolean;
    node?: FileTreeNode;
  }>({ visible: false });
  const [renameValue, setRenameValue] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);

  // Modal para eliminar
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
          label: '📄 Nuevo archivo',
          onClick: () => handleNewFileClick(node.path),
        },
        {
          label: '📋 Copiar ruta',
          onClick: () => {
            navigator.clipboard.writeText(node.path);
            setContextMenu((prev) => ({ ...prev, visible: false }));
          },
        },
      ];
    }

    return [
      {
        label: '✏️ Renombrar',
        onClick: () => handleRenameClick(node),
      },
      {
        label: '🗑️ Eliminar',
        onClick: () => handleDeleteClick(node),
      },
      {
        label: '📋 Copiar ruta',
        onClick: () => {
          navigator.clipboard.writeText(node.path);
          setContextMenu((prev) => ({ ...prev, visible: false }));
        },
      },
    ];
  };

  // ---- Modal Crear Archivo ----
  const handleCreateFile = async () => {
    if (!newFileName.trim() || !currentRepo) {
      alert('Por favor ingresa un nombre de archivo válido');
      return;
    }

    setIsCreating(true);
    try {
      await createFile(
        currentRepo.owner.login,
        currentRepo.name,
        createFileModal.folderPath,
        newFileName
      );

      setCreateFileModal({ visible: false, folderPath: '' });
      setNewFileName('');

      // Refresca árbol
      setTimeout(() => {
        fetchRepoTree(currentRepo.owner.login, currentRepo.name, currentRepo.default_branch);
      }, 800);

      alert(`✅ Archivo "${newFileName}" creado exitosamente`);
    } catch (error) {
      console.error('Error creating file:', error);
      alert('❌ Error al crear el archivo. Por favor intenta de nuevo.');
    } finally {
      setIsCreating(false);
    }
  };

  // ---- Modal Renombrar ----
  const handleRenameFile = async () => {
    if (!renameValue.trim() || !renameModal.node || !currentRepo) {
      alert('Por favor ingresa un nombre válido');
      return;
    }

    const node = renameModal.node;
    const parentPath = node.path.split('/').slice(0, -1).join('/');
    const newPath = parentPath ? `${parentPath}/${renameValue}` : renameValue;

    setIsRenaming(true);
    try {
      const success = await renameFile(
        currentRepo.owner.login,
        currentRepo.name,
        node.path,
        newPath,
        `Rename ${node.name} to ${renameValue}`,
        node.sha!,
        currentRepo.default_branch
      );

      if (success) {
        setRenameModal({ visible: false });
        setRenameValue('');

        // Refresca árbol
        setTimeout(() => {
          fetchRepoTree(currentRepo.owner.login, currentRepo.name, currentRepo.default_branch);
        }, 800);

        alert(`✅ Archivo renombrado a "${renameValue}" exitosamente`);
      } else {
        alert('❌ Error al renombrar el archivo');
      }
    } catch (error) {
      console.error('Error renaming file:', error);
      alert('❌ Error al renombrar el archivo');
    } finally {
      setIsRenaming(false);
    }
  };

  // ---- Modal Eliminar ----
  const handleDeleteFile = async () => {
    if (!deleteModal.node || !currentRepo) return;

    const node = deleteModal.node;
    setIsDeleting(true);

    try {
      const success = await deleteFile(
        currentRepo.owner.login,
        currentRepo.name,
        node.path,
        `Delete ${node.name}`,
        node.sha!,
        currentRepo.default_branch
      );

      if (success) {
        setDeleteModal({ visible: false });

        // Refresca árbol
        setTimeout(() => {
          fetchRepoTree(currentRepo.owner.login, currentRepo.name, currentRepo.default_branch);
        }, 800);

        alert(`✅ Archivo "${node.name}" eliminado exitosamente`);
      } else {
        alert('❌ Error al eliminar el archivo');
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('❌ Error al eliminar el archivo');
    } finally {
      setIsDeleting(false);
    }
  };

  const renderCreateFileModal = () => (
    createFileModal.visible && (
      <div
        className="fixed inset-0 flex items-center justify-center z-[100] bg-black bg-opacity-60"
        onClick={(e) => {
          if (e.target === e.currentTarget && !isCreating) {
            setCreateFileModal({ visible: false, folderPath: '' });
            setNewFileName('');
          }
        }}
      >
        <div className="bg-zinc-900 border border-zinc-700 p-6 rounded-lg shadow-xl flex flex-col min-w-[450px] max-w-[600px]">
          <h2 className="text-xl mb-4 text-white font-bold">
            📄 Crear nuevo archivo
          </h2>
          <p className="text-sm text-zinc-400 mb-4">
            Ubicación: <span className="text-emerald-400 font-mono">
              {createFileModal.folderPath || '/ (raíz)'}
            </span>
          </p>
          <input
            className="mb-5 p-3 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 focus:border-emerald-500 focus:outline-none text-base"
            type="text"
            placeholder="ejemplo.js"
            value={newFileName}
            onChange={e => setNewFileName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !isCreating && handleCreateFile()}
            disabled={isCreating}
            autoFocus
          />
          <div className="flex gap-3 justify-end">
            <button
              className="bg-zinc-700 px-5 py-2.5 rounded-lg text-white hover:bg-zinc-600 transition disabled:opacity-50"
              onClick={() => {
                setCreateFileModal({ visible: false, folderPath: '' });
                setNewFileName('');
              }}
              disabled={isCreating}
            >
              Cancelar
            </button>
            <button
              className="bg-emerald-600 px-5 py-2.5 rounded-lg text-white hover:bg-emerald-700 transition disabled:opacity-50 flex items-center gap-2"
              onClick={handleCreateFile}
              disabled={isCreating || !newFileName.trim()}
            >
              {isCreating ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creando...
                </>
              ) : (
                'Crear archivo'
              )}
            </button>
          </div>
        </div>
      </div>
    )
  );

  const renderRenameModal = () => (
    renameModal.visible && renameModal.node && (
      <div
        className="fixed inset-0 flex items-center justify-center z-[100] bg-black bg-opacity-60"
        onClick={(e) => {
          if (e.target === e.currentTarget && !isRenaming) {
            setRenameModal({ visible: false });
            setRenameValue('');
          }
        }}
      >
        <div className="bg-zinc-900 border border-zinc-700 p-6 rounded-lg shadow-xl flex flex-col min-w-[450px] max-w-[600px]">
          <h2 className="text-xl mb-4 text-white font-bold">
            ✏️ Renombrar archivo
          </h2>
          <p className="text-sm text-zinc-400 mb-2">
            Archivo actual:
          </p>
          <p className="text-sm text-white bg-zinc-800 p-2 rounded mb-4 font-mono">
            {renameModal.node.name}
          </p>
          <input
            className="mb-5 p-3 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 focus:border-blue-500 focus:outline-none text-base"
            type="text"
            placeholder="Nuevo nombre"
            value={renameValue}
            onChange={e => setRenameValue(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !isRenaming && handleRenameFile()}
            disabled={isRenaming}
            autoFocus
          />
          <div className="flex gap-3 justify-end">
            <button
              className="bg-zinc-700 px-5 py-2.5 rounded-lg text-white hover:bg-zinc-600 transition disabled:opacity-50"
              onClick={() => {
                setRenameModal({ visible: false });
                setRenameValue('');
              }}
              disabled={isRenaming}
            >
              Cancelar
            </button>
            <button
              className="bg-blue-600 px-5 py-2.5 rounded-lg text-white hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
              onClick={handleRenameFile}
              disabled={isRenaming || !renameValue.trim()}
            >
              {isRenaming ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Renombrando...
                </>
              ) : (
                'Renombrar'
              )}
            </button>
          </div>
        </div>
      </div>
    )
  );

  const renderDeleteModal = () => (
    deleteModal.visible && deleteModal.node && (
      <div
        className="fixed inset-0 flex items-center justify-center z-[100] bg-black bg-opacity-60"
        onClick={(e) => {
          if (e.target === e.currentTarget && !isDeleting) {
            setDeleteModal({ visible: false });
          }
        }}
      >
        <div className="bg-zinc-900 border border-red-500/50 p-6 rounded-lg shadow-xl flex flex-col min-w-[450px] max-w-[600px]">
          <h2 className="text-xl mb-4 text-red-400 font-bold flex items-center gap-2">
            <span>⚠️</span> Eliminar archivo
          </h2>
          <p className="text-sm text-zinc-300 mb-3">
            ¿Estás seguro de que deseas eliminar este archivo?
          </p>
          <p className="text-sm text-white bg-zinc-800 p-3 rounded mb-4 font-mono break-all">
            {deleteModal.node.path}
          </p>
          <div className="bg-red-500/10 border border-red-500/30 p-3 rounded mb-5">
            <p className="text-xs text-red-300">
              ⚠️ Esta acción no se puede deshacer. El archivo será eliminado permanentemente del repositorio de GitHub.
            </p>
          </div>
          <div className="flex gap-3 justify-end">
            <button
              className="bg-zinc-700 px-5 py-2.5 rounded-lg text-white hover:bg-zinc-600 transition disabled:opacity-50"
              onClick={() => setDeleteModal({ visible: false })}
              disabled={isDeleting}
            >
              Cancelar
            </button>
            <button
              className="bg-red-600 px-5 py-2.5 rounded-lg text-white hover:bg-red-700 transition disabled:opacity-50 flex items-center gap-2"
              onClick={handleDeleteFile}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Eliminando...
                </>
              ) : (
                'Eliminar permanentemente'
              )}
            </button>
          </div>
        </div>
      </div>
    )
  );

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
              className="relative flex w-full items-center gap-2 px-2 py-1.5 text-left text-sm hover:bg-zinc-800 transition-colors rounded"
              style={{ paddingLeft: `${indent + 8}px` }}
            >
              <span className="text-zinc-400 text-xs">{isExpanded ? '▼' : '▶'}</span>
              <span className="text-base">{isExpanded ? '📂' : '📁'}</span>
              <span className="truncate text-zinc-300 font-medium">{node.name}</span>
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
          className="relative flex w-full items-center gap-2 px-2 py-1.5 text-left text-sm hover:bg-zinc-800 transition-colors rounded"
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
        <div className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Cargando archivos...
        </div>
      </div>
    );
  }

  if (fileTree.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-xs text-zinc-500 mb-3">No se encontraron archivos</p>
        <button
          onClick={() => handleNewFileClick('')}
          className="text-xs bg-emerald-600 hover:bg-emerald-700 px-3 py-2 rounded text-white transition"
        >
          + Crear primer archivo
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="border-b border-zinc-800 px-3 py-2 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase text-zinc-400">
          Archivos
        </span>
        <button
          onClick={() => handleNewFileClick('')}
          className="text-xs bg-emerald-600 hover:bg-emerald-700 px-2 py-1 rounded text-white transition"
          title="Crear nuevo archivo en la raíz"
        >
          + Nuevo
        </button>
      </div>

      <div className="file-tree-container overflow-y-auto" style={{ maxHeight: 'calc(80vh - 40px)' }}>
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
      {renderCreateFileModal()}
      {renderRenameModal()}
      {renderDeleteModal()}
    </>
  );
}

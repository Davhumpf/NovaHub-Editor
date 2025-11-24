'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useEditorStore } from '@/store/useEditorStore';
import Link from 'next/link';

// Monaco Editor - load dynamically to avoid SSR issues
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-zinc-500">
      Cargando editor...
    </div>
  ),
});

export default function WorkspacePage() {
  const {
    openFiles,
    activeFileId,
    currentWorkspace,
    currentRepo,
    openFile,
    closeFile,
    updateFileContent,
    setActiveFile,
    setCurrentWorkspace,
  } = useEditorStore();

  const [showNewFileModal, setShowNewFileModal] = useState(false);
  const [showGitHubModal, setShowGitHubModal] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFileLanguage, setNewFileLanguage] = useState('javascript');

  const activeFile = openFiles.find(f => f.id === activeFileId);

  useEffect(() => {
    if (!currentWorkspace) {
      setCurrentWorkspace('Mi Workspace');
    }
  }, [currentWorkspace, setCurrentWorkspace]);

  const handleCreateFile = () => {
    if (!newFileName) return;

    const newFile = {
      id: `file-${Date.now()}`,
      name: newFileName,
      path: `/${newFileName}`,
      content: `// ${newFileName}\n\n`,
      language: newFileLanguage,
      lastModified: new Date(),
    };

    openFile(newFile);
    setShowNewFileModal(false);
    setNewFileName('');
  };

  const handleEditorChange = (value: string | undefined) => {
    if (activeFileId && value !== undefined) {
      updateFileContent(activeFileId, value);
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
      json: 'json',
      md: 'markdown',
      sh: 'shell',
    };
    return langMap[ext || ''] || 'plaintext';
  };

  return (
    <div className="flex h-screen flex-col bg-zinc-950 text-white">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900 px-4 py-2">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 via-sky-500 to-emerald-400 text-xs font-bold">
              NH
            </span>
            <span className="text-sm font-semibold">Novahub Editor</span>
          </Link>
          <div className="h-4 w-px bg-zinc-700" />
          <span className="text-sm text-zinc-400">{currentWorkspace}</span>
          {currentRepo && (
            <>
              <div className="h-4 w-px bg-zinc-700" />
              <span className="text-xs text-emerald-400">
                📁 {currentRepo.name}
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowGitHubModal(true)}
            className="rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-medium hover:bg-zinc-700"
          >
            {currentRepo ? 'Cambiar repo' : 'Conectar GitHub'}
          </button>
          <Link
            href="/docs"
            className="rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-medium hover:bg-zinc-700"
          >
            Docs
          </Link>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 border-r border-zinc-800 bg-zinc-900">
          <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2">
            <span className="text-xs font-semibold uppercase text-zinc-400">
              Archivos
            </span>
            <button
              onClick={() => setShowNewFileModal(true)}
              className="rounded px-2 py-1 text-xs hover:bg-zinc-800"
              title="Nuevo archivo"
            >
              +
            </button>
          </div>

          <div className="overflow-y-auto p-2">
            {openFiles.length === 0 ? (
              <div className="px-2 py-8 text-center text-xs text-zinc-500">
                No hay archivos abiertos
                <br />
                <button
                  onClick={() => setShowNewFileModal(true)}
                  className="mt-2 text-emerald-400 hover:underline"
                >
                  Crear nuevo archivo
                </button>
              </div>
            ) : (
              <ul className="space-y-1">
                {openFiles.map(file => (
                  <li
                    key={file.id}
                    className={`group flex items-center justify-between rounded px-2 py-1.5 text-sm cursor-pointer ${
                      file.id === activeFileId
                        ? 'bg-zinc-800 text-white'
                        : 'text-zinc-400 hover:bg-zinc-800/50'
                    }`}
                    onClick={() => setActiveFile(file.id)}
                  >
                    <span className="truncate">{file.name}</span>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        closeFile(file.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 hover:text-red-400"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>

        {/* Editor Area */}
        <div className="flex flex-1 flex-col">
          {/* Tab bar */}
          {openFiles.length > 0 && (
            <div className="flex items-center gap-1 border-b border-zinc-800 bg-zinc-900 px-2">
              {openFiles.map(file => (
                <div
                  key={file.id}
                  className={`group flex items-center gap-2 border-r border-zinc-800 px-3 py-2 text-sm cursor-pointer ${
                    file.id === activeFileId
                      ? 'bg-zinc-950 text-white'
                      : 'text-zinc-400 hover:bg-zinc-800'
                  }`}
                  onClick={() => setActiveFile(file.id)}
                >
                  <span>{file.name}</span>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      closeFile(file.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 hover:text-red-400"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Editor */}
          <div className="flex-1">
            {activeFile ? (
              <MonacoEditor
                height="100%"
                language={activeFile.language}
                value={activeFile.content}
                onChange={handleEditorChange}
                theme="vs-dark"
                options={{
                  minimap: { enabled: true },
                  fontSize: 14,
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                }}
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-zinc-500">
                <p className="text-lg">Bienvenido a Novahub Editor</p>
                <p className="mt-2 text-sm">
                  Abre o crea un archivo para comenzar
                </p>
                <button
                  onClick={() => setShowNewFileModal(true)}
                  className="mt-4 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600"
                >
                  Crear nuevo archivo
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New File Modal */}
      {showNewFileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg border border-zinc-700 bg-zinc-900 p-6 shadow-xl">
            <h2 className="text-lg font-semibold">Crear nuevo archivo</h2>
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm text-zinc-400">
                  Nombre del archivo
                </label>
                <input
                  type="text"
                  value={newFileName}
                  onChange={e => setNewFileName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCreateFile()}
                  placeholder="ejemplo.js"
                  className="mt-1 w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400">Lenguaje</label>
                <select
                  value={newFileLanguage}
                  onChange={e => setNewFileLanguage(e.target.value)}
                  className="mt-1 w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="typescript">TypeScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                  <option value="go">Go</option>
                  <option value="rust">Rust</option>
                  <option value="html">HTML</option>
                  <option value="css">CSS</option>
                  <option value="json">JSON</option>
                  <option value="markdown">Markdown</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowNewFileModal(false);
                  setNewFileName('');
                }}
                className="rounded-lg border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-800"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateFile}
                className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium hover:bg-emerald-600"
              >
                Crear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GitHub Modal */}
      {showGitHubModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-lg border border-zinc-700 bg-zinc-900 p-6 shadow-xl">
            <h2 className="text-lg font-semibold">Conectar con GitHub</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Esta función estará disponible próximamente. Permitirá conectar
              tu cuenta de GitHub y trabajar directamente con tus repositorios.
            </p>
            <div className="mt-6 rounded-lg border border-zinc-700 bg-zinc-800 p-4">
              <p className="text-xs font-semibold text-zinc-300">
                Próximas funcionalidades:
              </p>
              <ul className="mt-2 space-y-1 text-xs text-zinc-400">
                <li>• OAuth con GitHub</li>
                <li>• Listar y clonar repositorios</li>
                <li>• Commit y push directamente desde el editor</li>
                <li>• Sincronización automática</li>
              </ul>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowGitHubModal(false)}
                className="rounded-lg bg-zinc-700 px-4 py-2 text-sm hover:bg-zinc-600"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

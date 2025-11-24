'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useEditorStore } from '@/store/useEditorStore';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import GitHubConnect from '@/components/GitHubConnect';
import FileTree from '@/components/FileTree';
import ExploreButton from '@/components/ExploreButton';
import CodeBackgroundAnimation from '@/components/CodeBackgroundAnimation';

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
  const { data: session } = useSession();
  const {
    openFiles,
    activeFileId,
    currentWorkspace,
    currentRepo,
    repoFiles,
    openFile,
    closeFile,
    updateFileContent,
    setActiveFile,
    setCurrentWorkspace,
    saveFileToGitHub,
    setCurrentRepo,
  } = useEditorStore();

  const [showNewFileModal, setShowNewFileModal] = useState(false);
  const [showGitHubModal, setShowGitHubModal] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFileLanguage, setNewFileLanguage] = useState('javascript');
  const [unsavedChanges, setUnsavedChanges] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showRepoFiles, setShowRepoFiles] = useState(true);
  const originalContentRef = useRef<Map<string, string>>(new Map());

  const activeFile = openFiles.find((f) => f.id === activeFileId);

  useEffect(() => {
    if (!currentWorkspace) {
      setCurrentWorkspace('Mi Workspace');
    }
  }, [currentWorkspace, setCurrentWorkspace]);

  // Track original content to detect changes
  useEffect(() => {
    openFiles.forEach((file) => {
      if (!originalContentRef.current.has(file.id)) {
        originalContentRef.current.set(file.id, file.content);
      }
    });
  }, [openFiles]);

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
    originalContentRef.current.set(newFile.id, newFile.content);
    setShowNewFileModal(false);
    setNewFileName('');
  };

  const handleEditorChange = (value: string | undefined) => {
    if (activeFileId && value !== undefined) {
      updateFileContent(activeFileId, value);

      // Check if content has changed from original
      const originalContent = originalContentRef.current.get(activeFileId);
      const hasChanged = originalContent !== value;

      setUnsavedChanges((prev) => {
        const newSet = new Set(prev);
        if (hasChanged) {
          newSet.add(activeFileId);
        } else {
          newSet.delete(activeFileId);
        }
        return newSet;
      });
    }
  };

  const handleEditorMount = (editor: any, monaco: any) => {
    // Configure TypeScript compiler options for better JSX/TSX support
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      jsx: monaco.languages.typescript.JsxEmit.React,
      target: monaco.languages.typescript.ScriptTarget.ES2020,
      allowNonTsExtensions: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.CommonJS,
      noEmit: true,
      esModuleInterop: true,
      allowJs: true,
      typeRoots: ['node_modules/@types'],
      skipLibCheck: true,
      strict: false,
      noImplicitAny: false,
      allowSyntheticDefaultImports: true,
    });

    // Also configure JavaScript defaults
    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2020,
      allowNonTsExtensions: true,
      allowJs: true,
      noEmit: true,
    });

    // Disable excessive diagnostics to reduce false errors
    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,  // Disable semantic errors
      noSyntaxValidation: false,    // Keep syntax validation
      noSuggestionDiagnostics: true,
    });

    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: false,
      noSuggestionDiagnostics: true,
    });

    // Add keyboard shortcut for save (Ctrl+S / Cmd+S)
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      if (hasUnsavedChanges && isGitHubFile) {
        handleSaveToGitHub();
      }
    });
  };

  const handleSaveToGitHub = async () => {
    if (!activeFile || !currentRepo) return;

    // Check if file is from GitHub (starts with 'github-')
    if (!activeFile.id.startsWith('github-')) {
      alert('Este archivo no es de un repositorio de GitHub');
      return;
    }

    setShowSaveModal(true);
  };

  const performSave = async () => {
    if (!activeFile || !currentRepo || !saveMessage.trim()) {
      alert('Por favor ingresa un mensaje de commit');
      return;
    }

    setIsSaving(true);

    try {
      // Get the file SHA from repoFiles
      const repoFile = repoFiles.find((f) => f.path === activeFile.path);
      const sha = repoFile?.sha;

      const success = await saveFileToGitHub(
        currentRepo.owner.login,
        currentRepo.name,
        activeFile.path,
        activeFile.content,
        saveMessage,
        sha,
        currentRepo.default_branch
      );

      if (success) {
        alert('✅ Archivo guardado exitosamente en GitHub');
        // Update original content
        originalContentRef.current.set(activeFile.id, activeFile.content);
        setUnsavedChanges((prev) => {
          const newSet = new Set(prev);
          newSet.delete(activeFile.id);
          return newSet;
        });
        setShowSaveModal(false);
        setSaveMessage('');
      } else {
        alert('❌ Error al guardar el archivo');
      }
    } catch (error) {
      console.error('Error saving file:', error);
      alert('❌ Error al guardar el archivo');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRepoSelected = () => {
    // Refresh when repo is selected
    setShowRepoFiles(true);
  };

  const handleCloseProject = () => {
    if (unsavedChanges.size > 0) {
      const confirmed = confirm('Tienes cambios sin guardar. ¿Estás seguro de cerrar el proyecto?');
      if (!confirmed) return;
    }

    // Clear current repo and close all files
    setCurrentRepo(null);
    openFiles.forEach(file => closeFile(file.id));
    setUnsavedChanges(new Set());
    originalContentRef.current.clear();
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

  const isGitHubFile = activeFile?.id.startsWith('github-');
  const hasUnsavedChanges = activeFile && unsavedChanges.has(activeFile.id);

  return (
    <div className="flex h-screen flex-col bg-zinc-950 text-white">
      {/* Background animado */}
      <CodeBackgroundAnimation />

      {/* Header */}
      <header className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900 px-4 py-2" style={{ position: 'relative', zIndex: 1 }}>
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
              <div className="flex items-center gap-2">
                <span className="text-xs text-emerald-400">
                  📁 {currentRepo.name}
                </span>
                <button
                  onClick={handleCloseProject}
                  className="rounded px-1.5 py-0.5 text-xs text-zinc-400 hover:bg-zinc-800 hover:text-red-400"
                  title="Cerrar proyecto"
                >
                  ✕
                </button>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {session?.user && (
            <>
              <div className="flex items-center gap-2 rounded-lg bg-zinc-800/50 px-3 py-1.5 text-xs">
                <svg
                  className="h-4 w-4 text-zinc-400"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                <span className="text-zinc-300">
                  @{session.user.username || session.user.name}
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" title="Conectado a GitHub"></span>
              </div>
              <div className="h-4 w-px bg-zinc-700" />
            </>
          )}
          {isGitHubFile && hasUnsavedChanges && (
            <button
              onClick={handleSaveToGitHub}
              className="flex items-center gap-1 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-medium hover:bg-emerald-600"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                />
              </svg>
              Guardar en GitHub
            </button>
          )}
          {!session?.user && (
            <button
              onClick={() => setShowGitHubModal(true)}
              className="rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-medium hover:bg-zinc-700"
            >
              Conectar GitHub
            </button>
          )}
          <Link
            href="/docs"
            className="rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-medium hover:bg-zinc-700"
          >
            Docs
          </Link>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden" style={{ position: 'relative', zIndex: 1 }}>
        {/* Sidebar */}
        <aside className="w-64 border-r border-zinc-800 bg-zinc-900">
          {/* Tabs for switching between views */}
          <div className="flex border-b border-zinc-800">
            <button
              onClick={() => setShowRepoFiles(true)}
              className={`flex-1 px-4 py-2 text-xs font-semibold uppercase ${
                showRepoFiles
                  ? 'border-b-2 border-emerald-500 text-emerald-400'
                  : 'text-zinc-400 hover:text-zinc-300'
              }`}
            >
              Repositorio
            </button>
            <button
              onClick={() => setShowRepoFiles(false)}
              className={`flex-1 px-4 py-2 text-xs font-semibold uppercase ${
                !showRepoFiles
                  ? 'border-b-2 border-emerald-500 text-emerald-400'
                  : 'text-zinc-400 hover:text-zinc-300'
              }`}
            >
              Abiertos
            </button>
          </div>

          {showRepoFiles ? (
            <FileTree />
          ) : (
            <>
              <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2">
                <span className="text-xs font-semibold uppercase text-zinc-400">
                  Archivos Abiertos
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
                    {openFiles.map((file) => (
                      <li
                        key={file.id}
                        className={`group flex items-center justify-between rounded px-2 py-1.5 text-sm cursor-pointer ${
                          file.id === activeFileId
                            ? 'bg-zinc-800 text-white'
                            : 'text-zinc-400 hover:bg-zinc-800/50'
                        }`}
                        onClick={() => setActiveFile(file.id)}
                      >
                        <span className="flex items-center gap-1 truncate">
                          {unsavedChanges.has(file.id) && (
                            <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                          )}
                          {file.name}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            closeFile(file.id);
                            originalContentRef.current.delete(file.id);
                            setUnsavedChanges((prev) => {
                              const newSet = new Set(prev);
                              newSet.delete(file.id);
                              return newSet;
                            });
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
            </>
          )}
        </aside>

        {/* Editor Area */}
        <div className="flex flex-1 flex-col">
          {/* Tab bar */}
          {openFiles.length > 0 && (
            <div className="flex items-center gap-1 border-b border-zinc-800 bg-zinc-900 px-2">
              {openFiles.map((file) => (
                <div
                  key={file.id}
                  className={`group flex items-center gap-2 border-r border-zinc-800 px-3 py-2 text-sm cursor-pointer ${
                    file.id === activeFileId
                      ? 'bg-zinc-950 text-white'
                      : 'text-zinc-400 hover:bg-zinc-800'
                  }`}
                  onClick={() => setActiveFile(file.id)}
                >
                  {unsavedChanges.has(file.id) && (
                    <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                  )}
                  <span>{file.name}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      closeFile(file.id);
                      originalContentRef.current.delete(file.id);
                      setUnsavedChanges((prev) => {
                        const newSet = new Set(prev);
                        newSet.delete(file.id);
                        return newSet;
                      });
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
                onMount={handleEditorMount}
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
                {session?.user ? (
                  // Usuario YA está conectado a GitHub
                  <>
                    <p className="text-2xl font-semibold text-white">
                      ¡Hola @{session.user.username || session.user.name}! 👋
                    </p>
                    <p className="mt-2 text-sm">
                      Explora tus proyectos y comienza a codear
                    </p>
                    <div className="mt-8 flex gap-4">
                      <ExploreButton onClick={() => setShowGitHubModal(true)} />
                      <button
                        onClick={() => setShowNewFileModal(true)}
                        className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
                      >
                        Crear archivo local
                      </button>
                    </div>
                  </>
                ) : (
                  // Usuario NO está conectado
                  <>
                    <p className="text-lg">Bienvenido a Novahub Editor</p>
                    <p className="mt-2 text-sm">
                      Conecta GitHub o crea un archivo para comenzar
                    </p>
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => setShowGitHubModal(true)}
                        className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600"
                      >
                        Conectar GitHub
                      </button>
                      <button
                        onClick={() => setShowNewFileModal(true)}
                        className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
                      >
                        Crear archivo local
                      </button>
                    </div>
                  </>
                )}
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
                  onChange={(e) => setNewFileName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateFile()}
                  placeholder="ejemplo.js"
                  className="mt-1 w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400">Lenguaje</label>
                <select
                  value={newFileLanguage}
                  onChange={(e) => setNewFileLanguage(e.target.value)}
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

      {/* Save to GitHub Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg border border-zinc-700 bg-zinc-900 p-6 shadow-xl">
            <h2 className="text-lg font-semibold">Guardar en GitHub</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Ingresa un mensaje de commit para guardar los cambios
            </p>
            <div className="mt-4">
              <label className="block text-sm text-zinc-400">
                Mensaje de commit
              </label>
              <textarea
                value={saveMessage}
                onChange={(e) => setSaveMessage(e.target.value)}
                placeholder="Describe los cambios realizados..."
                className="mt-1 w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                rows={3}
                autoFocus
              />
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowSaveModal(false);
                  setSaveMessage('');
                }}
                disabled={isSaving}
                className="rounded-lg border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-800 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={performSave}
                disabled={isSaving || !saveMessage.trim()}
                className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium hover:bg-emerald-600 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <svg
                      className="h-4 w-4 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Guardando...
                  </>
                ) : (
                  'Guardar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GitHub Modal */}
      {showGitHubModal && (
        <GitHubConnect
          onClose={() => setShowGitHubModal(false)}
          onRepoSelected={handleRepoSelected}
        />
      )}
    </div>
  );
}

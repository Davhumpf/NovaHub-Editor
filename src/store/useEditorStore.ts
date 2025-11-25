import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface FileItem {
  id: string;
  name: string;
  path: string;
  content: string;
  language: string;
  lastModified: Date;
  isDirty: boolean;
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
    avatar_url?: string;
  };
  private: boolean;
  html_url: string;
  description?: string;
  default_branch: string;
  language?: string;
  updated_at?: string;
}

export interface GitHubFile {
  path: string;
  sha: string;
  size?: number;
  type: string;
  url?: string;
}

export interface GitHubFileContent {
  name: string;
  path: string;
  sha: string;
  size: number;
  content: string;
  url?: string;
}

interface EditorState {
  // Files and workspace
  currentWorkspace: string | null;
  openFiles: FileItem[];
  activeFileId: string | null;
  recentFiles: FileItem[];

  // Terminal
  terminalVisible: boolean;

  // GitHub integration
  githubToken: string | null;
  githubRepos: GitHubRepo[];
  currentRepo: GitHubRepo | null;
  repoFiles: GitHubFile[];
  repoFolders: GitHubFile[];
  isLoadingRepos: boolean;
  isLoadingFiles: boolean;

  // Notes
  notes: NoteItem[];

  // Actions for files
  openFile: (file: FileItem) => void;
  closeFile: (fileId: string) => void;
  updateFileContent: (fileId: string, content: string) => void;
  setFileDirty: (fileId: string, isDirty: boolean) => void;
  renameFile: (fileId: string, newName: string) => void;
  deleteFile: (fileId: string) => void;
  setActiveFile: (fileId: string) => void;

  // Actions for workspace
  setCurrentWorkspace: (workspace: string) => void;

  // Terminal actions
  setTerminalVisible: (visible: boolean) => void;

  // Actions for GitHub
  setGitHubToken: (token: string | null) => void;
  setGitHubRepos: (repos: GitHubRepo[]) => void;
  setCurrentRepo: (repo: GitHubRepo | null) => void;
  fetchRepositories: () => Promise<void>;
  fetchRepoTree: (owner: string, repo: string, branch?: string) => Promise<void>;
  fetchFileContent: (owner: string, repo: string, path: string) => Promise<GitHubFileContent | null>;
  saveFileToGitHub: (
    owner: string,
    repo: string,
    path: string,
    content: string,
    message: string,
    sha?: string,
    branch?: string
  ) => Promise<boolean>;
  createFile: (
    owner: string,
    repo: string,
    folderPath: string,
    fileName: string,
    branch?: string
  ) => Promise<boolean>;
  deleteRepoFile: (
    owner: string,
    repo: string,
    path: string,
    message: string,
    sha: string,
    branch?: string
  ) => Promise<boolean>;
  renameRepoFile: (
    owner: string,
    repo: string,
    oldPath: string,
    newPath: string,
    message: string,
    sha: string,
    branch?: string
  ) => Promise<boolean>;

  // Actions for notes
  addNote: (title: string, content: string) => void;
  updateNote: (id: string, title: string, content: string) => void;
  deleteNote: (id: string) => void;
}

export const useEditorStore = create<EditorState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentWorkspace: null,
      openFiles: [],
      activeFileId: null,
      recentFiles: [],
      terminalVisible: false,
      githubToken: null,
      githubRepos: [],
      currentRepo: null,
      repoFiles: [],
      repoFolders: [],
      isLoadingRepos: false,
      isLoadingFiles: false,
      notes: [],

      // File actions
      openFile: (file: FileItem) => {
        const { openFiles, recentFiles } = get();
        const normalizedFile: FileItem = {
          ...file,
          isDirty: file.isDirty ?? false,
        };

        // Check if file is already open
        const isOpen = openFiles.find(f => f.id === normalizedFile.id);

        if (!isOpen) {
          set({
            openFiles: [...openFiles, normalizedFile],
            activeFileId: normalizedFile.id,
          });
        } else {
          set({ activeFileId: normalizedFile.id });
        }

        // Update recent files
        const filteredRecent = recentFiles.filter(f => f.id !== normalizedFile.id);
        set({
          recentFiles: [normalizedFile, ...filteredRecent].slice(0, 20), // Keep last 20 files
        });
      },

      closeFile: (fileId: string) => {
        const { openFiles, activeFileId } = get();
        const newOpenFiles = openFiles.filter(f => f.id !== fileId);

        let newActiveFileId = activeFileId;
        if (activeFileId === fileId) {
          newActiveFileId = newOpenFiles.length > 0 ? newOpenFiles[0].id : null;
        }

        set({
          openFiles: newOpenFiles,
          activeFileId: newActiveFileId,
        });
      },

      updateFileContent: (fileId: string, content: string) => {
        const { openFiles, recentFiles } = get();

        let nextActiveId: string | null = null;

        const updateFile = (file: FileItem) => {
          if (file.id !== fileId) return file;

          const updated = {
            ...file,
            content,
            lastModified: new Date(),
            isDirty: true,
          };
          nextActiveId = updated.id;
          return updated;
        };

        const updatedOpenFiles = openFiles.map(updateFile);
        const updatedRecentFiles = recentFiles.map(updateFile);

        set({
          openFiles: updatedOpenFiles,
          recentFiles: updatedRecentFiles,
          activeFileId: nextActiveId ?? get().activeFileId,
        });
      },

      setFileDirty: (fileId: string, isDirty: boolean) => {
        const { openFiles, recentFiles } = get();

        const updateFile = (file: FileItem) =>
          file.id === fileId ? { ...file, isDirty } : file;

        set({
          openFiles: openFiles.map(updateFile),
          recentFiles: recentFiles.map(updateFile),
        });
      },

      renameFile: (fileId: string, newName: string) => {
        const { openFiles, recentFiles, activeFileId } = get();
        let updatedActiveId = activeFileId;

        const rename = (file: FileItem) => {
          if (file.id !== fileId) return file;

          const pathParts = file.path.split('/');
          pathParts[pathParts.length - 1] = newName;
          const newPath = pathParts.join('/');
          const newId = file.id.startsWith('github-')
            ? `github-${newPath}`
            : file.id;

          if (updatedActiveId === fileId) {
            updatedActiveId = newId;
          }

          return {
            ...file,
            id: newId,
            name: newName,
            path: newPath,
          };
        };

        const updatedOpen = openFiles.map(rename);
        const updatedRecent = recentFiles.map(rename);

        set({
          openFiles: updatedOpen,
          recentFiles: updatedRecent,
          activeFileId: updatedActiveId,
        });
      },

      deleteFile: (fileId: string) => {
        const { openFiles, recentFiles, activeFileId } = get();

        const newOpenFiles = openFiles.filter(f => f.id !== fileId);
        const newRecentFiles = recentFiles.filter(f => f.id !== fileId);

        let newActiveFileId = activeFileId;
        if (activeFileId === fileId) {
          newActiveFileId = newOpenFiles.length > 0 ? newOpenFiles[0].id : null;
        }

        set({
          openFiles: newOpenFiles,
          recentFiles: newRecentFiles,
          activeFileId: newActiveFileId,
        });
      },

      setActiveFile: (fileId: string) => {
        set({ activeFileId: fileId });
      },

      // Workspace actions
      setCurrentWorkspace: (workspace: string) => {
        set({ currentWorkspace: workspace });
      },

      // Terminal actions
      setTerminalVisible: (visible: boolean) => {
        set({ terminalVisible: visible });
      },

      // GitHub actions
      setGitHubToken: (token: string | null) => {
        set({ githubToken: token });
      },

      setGitHubRepos: (repos: GitHubRepo[]) => {
        set({ githubRepos: repos });
      },

      setCurrentRepo: (repo: GitHubRepo | null) => {
        set({ currentRepo: repo });
      },

      fetchRepositories: async () => {
        set({ isLoadingRepos: true });
        try {
          const response = await fetch('/api/github/repos?per_page=100&sort=updated');
          if (!response.ok) {
            throw new Error('Failed to fetch repositories');
          }
          const data = await response.json();
          set({ githubRepos: data.repos, isLoadingRepos: false });
        } catch (error) {
          console.error('Error fetching repositories:', error);
          set({ isLoadingRepos: false });
        }
      },

      fetchRepoTree: async (owner: string, repo: string, branch?: string) => {
        set({ isLoadingFiles: true });
        try {
          const params = new URLSearchParams({ owner, repo });
          if (branch) params.append('branch', branch);

          const response = await fetch(`/api/github/tree?${params}`);
          if (!response.ok) {
            throw new Error('Failed to fetch repository tree');
          }
          const data = await response.json();
          set({
            repoFiles: data.files || [],
            repoFolders: data.folders || [],
            isLoadingFiles: false,
          });
        } catch (error) {
          console.error('Error fetching repository tree:', error);
          set({ isLoadingFiles: false });
        }
      },

      fetchFileContent: async (owner: string, repo: string, path: string) => {
        try {
          const params = new URLSearchParams({ owner, repo, path });
          const response = await fetch(`/api/github/file?${params}`);
          if (!response.ok) {
            throw new Error('Failed to fetch file content');
          }
          const data = await response.json();
          return data as GitHubFileContent;
        } catch (error) {
          console.error('Error fetching file content:', error);
          return null;
        }
      },

      saveFileToGitHub: async (
        owner: string,
        repo: string,
        path: string,
        content: string,
        message: string,
        sha?: string,
        branch?: string
      ) => {
        try {
          const response = await fetch('/api/github/commit', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              owner,
              repo,
              path,
              content,
              message,
              sha,
              branch,
            }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to save file');
          }

          return true;
        } catch (error) {
          console.error('Error saving file to GitHub:', error);
          return false;
        }
      },

      // NUEVA ACCION: Crear archivos en el repo
      createFile: async (
        owner: string,
        repo: string,
        folderPath: string,
        fileName: string,
        branch?: string
      ) => {
        const fullPath = folderPath ? `${folderPath.replace(/\/$/, '')}/${fileName}` : fileName;
        console.log('[createFile] -> sending', { owner, repo, fullPath, branch });

        const response = await fetch('/api/github/commit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            owner,
            repo,
            path: fullPath,
            content: '\n', // evita validaciones de falsy y crea archivo vacio
            message: `Create ${fileName}`,
            branch,
          }),
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          console.error('[createFile] failed', response.status, error);
          throw new Error(error.error || 'Failed to create file');
        }

        console.log('[createFile] success', await response.json());
        return true;
      },

      // Eliminar archivo de GitHub
      deleteRepoFile: async (
        owner: string,
        repo: string,
        path: string,
        message: string,
        sha: string,
        branch?: string
      ) => {
        try {
          const response = await fetch('/api/github/delete', {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              owner,
              repo,
              path,
              message,
              sha,
              branch,
            }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to delete file');
          }

          return true;
        } catch (error) {
          console.error('Error deleting file from GitHub:', error);
          return false;
        }
      },

      // Renombrar archivo en GitHub
      renameRepoFile: async (
        owner: string,
        repo: string,
        oldPath: string,
        newPath: string,
        message: string,
        sha: string,
        branch?: string
      ) => {
        try {
          const response = await fetch('/api/github/rename', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              owner,
              repo,
              oldPath,
              newPath,
              message,
              sha,
              branch,
            }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to rename file');
          }

          return true;
        } catch (error) {
          console.error('Error renaming file in GitHub:', error);
          return false;
        }
      },

      // Notes actions
      addNote: (title: string, content: string) => {
        const { notes } = get();
        const newNote: NoteItem = {
          id: `note-${Date.now()}`,
          title,
          content,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set({ notes: [newNote, ...notes] });
      },

      updateNote: (id: string, title: string, content: string) => {
        const { notes } = get();
        set({
          notes: notes.map(note =>
            note.id === id
              ? { ...note, title, content, updatedAt: new Date() }
              : note
          ),
        });
      },

      deleteNote: (id: string) => {
        const { notes } = get();
        set({ notes: notes.filter(note => note.id !== id) });
      },
    }),
    {
      name: 'novahub-editor-storage',
    }
  )
);

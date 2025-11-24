import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface FileItem {
  id: string;
  name: string;
  path: string;
  content: string;
  language: string;
  lastModified: Date;
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
  setActiveFile: (fileId: string) => void;

  // Actions for workspace
  setCurrentWorkspace: (workspace: string) => void;

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
    fileName: string
  ) => Promise<void>;

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

        // Check if file is already open
        const isOpen = openFiles.find(f => f.id === file.id);

        if (!isOpen) {
          set({
            openFiles: [...openFiles, file],
            activeFileId: file.id,
          });
        } else {
          set({ activeFileId: file.id });
        }

        // Update recent files
        const filteredRecent = recentFiles.filter(f => f.id !== file.id);
        set({
          recentFiles: [file, ...filteredRecent].slice(0, 20), // Keep last 20 files
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

        const updateFile = (file: FileItem) =>
          file.id === fileId
            ? { ...file, content, lastModified: new Date() }
            : file;

        set({
          openFiles: openFiles.map(updateFile),
          recentFiles: recentFiles.map(updateFile),
        });
      },

      setActiveFile: (fileId: string) => {
        set({ activeFileId: fileId });
      },

      // Workspace actions
      setCurrentWorkspace: (workspace: string) => {
        set({ currentWorkspace: workspace });
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

      // NUEVA ACCION: Crear archivos en el repo (usa tu propia API/backend si lo modificas)
      createFile: async (
        owner: string,
        repo: string,
        folderPath: string,
        fileName: string
      ) => {
        try {
          const fullPath = folderPath ? `${folderPath}/${fileName}` : fileName;
          const response = await fetch('/api/github/file', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              owner,
              repo,
              path: fullPath,
              content: '', // contenido inicial vacío o como lo quieras
              // Puedes agregar "message" si tu endpoint lo requiere, ej: "Creación de archivo"
            }),
          });
          if (!response.ok) {
            throw new Error('Failed to create file');
          }
        } catch (error) {
          console.error('Error creating file:', error);
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

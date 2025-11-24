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
  owner: string;
  private: boolean;
  html_url: string;
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

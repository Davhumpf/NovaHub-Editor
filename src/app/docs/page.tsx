'use client';

import { useState } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import Link from 'next/link';

export default function DocsPage() {
  const { recentFiles, notes, addNote, updateNote, deleteNote, openFile } =
    useEditorStore();

  const [activeTab, setActiveTab] = useState<'history' | 'notes'>('history');
  const [showNewNoteModal, setShowNewNoteModal] = useState(false);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');

  const handleCreateNote = () => {
    if (!noteTitle || !noteContent) return;
    addNote(noteTitle, noteContent);
    setShowNewNoteModal(false);
    setNoteTitle('');
    setNoteContent('');
  };

  const handleUpdateNote = () => {
    if (!editingNote || !noteTitle || !noteContent) return;
    updateNote(editingNote, noteTitle, noteContent);
    setEditingNote(null);
    setNoteTitle('');
    setNoteContent('');
  };

  const handleEditNote = (noteId: string) => {
    const note = notes.find(n => n.id === noteId);
    if (note) {
      setEditingNote(noteId);
      setNoteTitle(note.title);
      setNoteContent(note.content);
    }
  };

  const handleDeleteNote = (noteId: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar esta nota?')) {
      deleteNote(noteId);
    }
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 via-white to-zinc-50 dark:from-black dark:via-zinc-950 dark:to-black">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-zinc-200/80 bg-white/80 backdrop-blur dark:border-zinc-800/80 dark:bg-black/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80">
              <img
                src="/logo.png"
                alt="Novahub Logo"
                className="h-9 w-9 rounded-xl object-cover shadow-lg"
              />
              <div>
                <p className="text-sm font-semibold">Novahub Editor</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Documentos y Notas
                </p>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/workspace"
              className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              Ir al Workspace
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-6 py-8">
        {/* Tabs */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex gap-2 rounded-full border border-zinc-200 bg-white p-1 dark:border-zinc-800 dark:bg-zinc-900">
            <button
              onClick={() => setActiveTab('history')}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'history'
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-black'
                  : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
              }`}
            >
              Historial de archivos
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'notes'
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-black'
                  : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
              }`}
            >
              Diario de notas
            </button>
          </div>

          {activeTab === 'notes' && (
            <button
              onClick={() => setShowNewNoteModal(true)}
              className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-600"
            >
              + Nueva nota
            </button>
          )}
        </div>

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                Archivos recientes
              </h2>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Historial de archivos editados ordenados por último acceso
              </p>
            </div>

            {recentFiles.length === 0 ? (
              <div className="rounded-2xl border border-zinc-200 bg-white p-12 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <p className="text-zinc-500 dark:text-zinc-400">
                  No hay archivos recientes
                </p>
                <p className="mt-2 text-sm text-zinc-400 dark:text-zinc-500">
                  Los archivos que abras o edites aparecerán aquí
                </p>
                <Link
                  href="/workspace"
                  className="mt-4 inline-block rounded-full bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600"
                >
                  Ir al Workspace
                </Link>
              </div>
            ) : (
              <div className="grid gap-3">
                {recentFiles.map((file, index) => (
                  <div
                    key={file.id}
                    className="group rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition-all hover:border-emerald-500 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-emerald-500"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500">
                            #{index + 1}
                          </span>
                          <h3 className="font-semibold text-zinc-900 dark:text-white">
                            {file.name}
                          </h3>
                          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                            {file.language}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                          {file.path}
                        </p>
                        <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">
                          Último acceso: {formatDate(file.lastModified)}
                        </p>
                      </div>
                      <Link
                        href="/workspace"
                        onClick={() => openFile(file)}
                        className="rounded-lg bg-emerald-500 px-3 py-1.5 text-sm font-medium text-white opacity-0 transition-opacity hover:bg-emerald-600 group-hover:opacity-100"
                      >
                        Abrir
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Notes Tab */}
        {activeTab === 'notes' && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                Diario de notas
              </h2>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Guarda tus ideas, recordatorios y anotaciones
              </p>
            </div>

            {notes.length === 0 ? (
              <div className="rounded-2xl border border-zinc-200 bg-white p-12 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <p className="text-zinc-500 dark:text-zinc-400">
                  No tienes notas guardadas
                </p>
                <p className="mt-2 text-sm text-zinc-400 dark:text-zinc-500">
                  Crea tu primera nota para comenzar
                </p>
                <button
                  onClick={() => setShowNewNoteModal(true)}
                  className="mt-4 rounded-full bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600"
                >
                  + Nueva nota
                </button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {notes.map(note => (
                  <div
                    key={note.id}
                    className="group rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    <div className="flex items-start justify-between">
                      <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                        {note.title}
                      </h3>
                      <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          onClick={() => handleEditNote(note.id)}
                          className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-white"
                          title="Editar"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          className="rounded p-1 text-zinc-400 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30"
                          title="Eliminar"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-600 dark:text-zinc-300">
                      {note.content}
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-xs text-zinc-400 dark:text-zinc-500">
                      <span>Creada: {formatDate(note.createdAt)}</span>
                      {note.updatedAt.getTime() !== note.createdAt.getTime() && (
                        <>
                          <span>•</span>
                          <span>Editada: {formatDate(note.updatedAt)}</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* New/Edit Note Modal */}
      {(showNewNoteModal || editingNote) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
              {editingNote ? 'Editar nota' : 'Nueva nota'}
            </h2>
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Título
                </label>
                <input
                  type="text"
                  value={noteTitle}
                  onChange={e => setNoteTitle(e.target.value)}
                  placeholder="Título de la nota"
                  className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Contenido
                </label>
                <textarea
                  value={noteContent}
                  onChange={e => setNoteContent(e.target.value)}
                  placeholder="Escribe tus ideas aquí..."
                  rows={8}
                  className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowNewNoteModal(false);
                  setEditingNote(null);
                  setNoteTitle('');
                  setNoteContent('');
                }}
                className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Cancelar
              </button>
              <button
                onClick={editingNote ? handleUpdateNote : handleCreateNote}
                className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600"
              >
                {editingNote ? 'Guardar cambios' : 'Crear nota'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useEditorStore } from '@/store/useEditorStore';

interface GitHubConnectProps {
  onClose: () => void;
  onRepoSelected: () => void;
}

export default function GitHubConnect({ onClose, onRepoSelected }: GitHubConnectProps) {
  const { data: session, status } = useSession();
  const {
    githubRepos,
    currentRepo,
    isLoadingRepos,
    fetchRepositories,
    setCurrentRepo,
  } = useEditorStore();

  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (session && status === 'authenticated') {
      fetchRepositories();
    }
  }, [session, status, fetchRepositories]);

  const handleSignIn = () => {
    signIn('github');
  };

  const handleSignOut = () => {
    signOut();
    setCurrentRepo(null);
  };

  const handleSelectRepo = (repo: typeof githubRepos[0]) => {
    setCurrentRepo(repo);
    onRepoSelected();
    onClose();
  };

  const filteredRepos = githubRepos.filter(
    (repo) =>
      repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repo.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (status === 'loading') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="w-full max-w-2xl rounded-lg border border-zinc-700 bg-zinc-900 p-6 shadow-xl">
          <div className="flex items-center justify-center py-8">
            <div className="text-zinc-400">Cargando...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="w-full max-w-md rounded-lg border border-zinc-700 bg-zinc-900 p-6 shadow-xl">
          <h2 className="text-lg font-semibold">Conectar con GitHub</h2>
          <p className="mt-2 text-sm text-zinc-400">
            Conecta tu cuenta de GitHub para acceder a tus repositorios y trabajar
            directamente con ellos desde el editor.
          </p>

          <div className="mt-6 rounded-lg border border-zinc-700 bg-zinc-800 p-4">
            <p className="text-xs font-semibold text-zinc-300">
              Funcionalidades:
            </p>
            <ul className="mt-2 space-y-1 text-xs text-zinc-400">
              <li>• Acceso a todos tus repositorios (públicos y privados)</li>
              <li>• Editar archivos directamente en el navegador</li>
              <li>• Crear commits y hacer push a GitHub</li>
              <li>• Sincronización en tiempo real</li>
            </ul>
          </div>

          <div className="mt-6 flex justify-between">
            <button
              onClick={onClose}
              className="rounded-lg border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-800"
            >
              Cancelar
            </button>
            <button
              onClick={handleSignIn}
              className="flex items-center gap-2 rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium hover:bg-zinc-700"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  clipRule="evenodd"
                />
              </svg>
              Conectar con GitHub
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-3xl rounded-lg border border-zinc-700 bg-zinc-900 shadow-xl">
        {/* Header */}
        <div className="border-b border-zinc-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Tus Repositorios</h2>
              <div className="mt-1 flex items-center gap-2 text-sm text-zinc-400">
                <img
                  src={session.user.avatar}
                  alt={session.user.username}
                  className="h-5 w-5 rounded-full"
                />
                <span>@{session.user.username}</span>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs hover:bg-zinc-800"
            >
              Desconectar
            </button>
          </div>

          {/* Search bar */}
          <div className="mt-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar repositorio..."
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Repository list */}
        <div className="max-h-96 overflow-y-auto p-4">
          {isLoadingRepos ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-zinc-400">Cargando repositorios...</div>
            </div>
          ) : filteredRepos.length === 0 ? (
            <div className="py-8 text-center text-sm text-zinc-500">
              {searchQuery
                ? 'No se encontraron repositorios'
                : 'No tienes repositorios'}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredRepos.map((repo) => (
                <button
                  key={repo.id}
                  onClick={() => handleSelectRepo(repo)}
                  className={`w-full rounded-lg border p-4 text-left transition-colors ${
                    currentRepo?.id === repo.id
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : 'border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{repo.name}</span>
                        {repo.private && (
                          <span className="rounded bg-zinc-700 px-1.5 py-0.5 text-xs">
                            Privado
                          </span>
                        )}
                      </div>
                      {repo.description && (
                        <p className="mt-1 text-sm text-zinc-400">
                          {repo.description}
                        </p>
                      )}
                      <div className="mt-2 flex items-center gap-3 text-xs text-zinc-500">
                        {repo.language && (
                          <span className="flex items-center gap-1">
                            <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                            {repo.language}
                          </span>
                        )}
                        {repo.updated_at && (
                          <span>
                            Actualizado{' '}
                            {new Date(repo.updated_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    {currentRepo?.id === repo.id && (
                      <svg
                        className="h-5 w-5 text-emerald-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-zinc-700 p-4">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="rounded-lg bg-zinc-700 px-4 py-2 text-sm hover:bg-zinc-600"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

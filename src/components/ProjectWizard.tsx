"use client";
import React, { useState } from 'react';
import { VscClose, VscLoading } from 'react-icons/vsc';
import { useTheme } from '@/contexts/ThemeContext';

interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'frontend' | 'backend' | 'fullstack' | 'mobile';
  isPremium: boolean;
  command: string; // El comando real que se ejecutará
}

const PROJECT_TEMPLATES: ProjectTemplate[] = [
  // FRONTEND
  {
    id: 'vite-react',
    name: 'React + Vite',
    description: 'React 18 con Vite, ESLint y Hot Reload',
    icon: '⚛️',
    category: 'frontend',
    isPremium: false,
    command: 'npm create vite@latest {name} -- --template react'
  },
  {
    id: 'vite-vue',
    name: 'Vue 3 + Vite',
    description: 'Vue 3 Composition API con Vite',
    icon: '💚',
    category: 'frontend',
    isPremium: false,
    command: 'npm create vite@latest {name} -- --template vue'
  },
  {
    id: 'nextjs',
    name: 'Next.js 14',
    description: 'Next.js con App Router y TypeScript',
    icon: '▲',
    category: 'frontend',
    isPremium: false,
    command: 'npx create-next-app@latest {name} --typescript --tailwind --app --yes'
  },
  {
    id: 'html-css-js',
    name: 'HTML/CSS/JS',
    description: 'Proyecto básico con HTML, CSS y JavaScript',
    icon: '🌐',
    category: 'frontend',
    isPremium: false,
    command: 'mkdir {name} && cd {name} && echo "<!DOCTYPE html><html><head><title>My Project</title></head><body><h1>Hello World</h1></body></html>" > index.html'
  },
  
  // BACKEND
  {
    id: 'express',
    name: 'Express.js',
    description: 'Node.js API con Express',
    icon: '🟢',
    category: 'backend',
    isPremium: false,
    command: 'npx express-generator {name}'
  },
  {
    id: 'django',
    name: 'Django',
    description: 'Django Full Stack con PostgreSQL',
    icon: '🐍',
    category: 'backend',
    isPremium: false,
    command: 'django-admin startproject {name}'
  },
  {
    id: 'fastapi',
    name: 'FastAPI',
    description: 'FastAPI con SQLAlchemy',
    icon: '⚡',
    category: 'backend',
    isPremium: true,
    command: 'pip install fastapi && mkdir {name} && cd {name}'
  },
  
  // FULLSTACK
  {
    id: 'mern',
    name: 'MERN Stack',
    description: 'MongoDB + Express + React + Node',
    icon: '📦',
    category: 'fullstack',
    isPremium: true,
    command: 'npx create-mern-app {name}'
  },
  
  // MOBILE
  {
    id: 'react-native',
    name: 'React Native',
    description: 'App móvil con Expo',
    icon: '📱',
    category: 'mobile',
    isPremium: true,
    command: 'npx create-expo-app {name}'
  }
];

interface ProjectWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (projectPath: string) => void;
}

export default function ProjectWizard({ isOpen, onClose, onProjectCreated }: ProjectWizardProps) {
  const theme = useTheme();
  const [step, setStep] = useState<'template' | 'config' | 'creating'>('template');
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);
  const [projectName, setProjectName] = useState('');
  const [createGitRepo, setCreateGitRepo] = useState(false);
  const [repoVisibility, setRepoVisibility] = useState<'public' | 'private'>('private');
  const [isCreating, setIsCreating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', name: 'Todos', icon: '📦' },
    { id: 'frontend', name: 'Frontend', icon: '🎨' },
    { id: 'backend', name: 'Backend', icon: '⚙️' },
    { id: 'fullstack', name: 'Full Stack', icon: '🚀' },
    { id: 'mobile', name: 'Mobile', icon: '📱' }
  ];

  const filteredTemplates = selectedCategory === 'all' 
    ? PROJECT_TEMPLATES 
    : PROJECT_TEMPLATES.filter(t => t.category === selectedCategory);

  const handleSelectTemplate = (template: ProjectTemplate) => {
    setSelectedTemplate(template);
    setStep('config');
  };

  const handleCreateProject = async () => {
    if (!selectedTemplate || !projectName.trim()) return;

    setIsCreating(true);
    setStep('creating');

    try {
      // 1. Crear el proyecto localmente
      const command = selectedTemplate.command.replace('{name}', projectName);
      
      const response = await fetch('/api/projects/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command,
          projectName,
          template: selectedTemplate.id
        })
      });

      if (!response.ok) throw new Error('Failed to create project');

      const data = await response.json();

      // 2. Crear repositorio en GitHub si se seleccionó
      if (createGitRepo) {
        const repoResponse = await fetch('/api/github/create-repo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: projectName,
            description: `${selectedTemplate.name} project created with Novahub Editor`,
            private: repoVisibility === 'private',
            auto_init: true
          })
        });

        if (!repoResponse.ok) throw new Error('Failed to create GitHub repo');

        const repoData = await repoResponse.json();

        // 3. Inicializar Git y hacer push inicial
        await fetch('/api/projects/init-git', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectPath: data.projectPath,
            repoUrl: repoData.clone_url
          })
        });
      }

      onProjectCreated(data.projectPath);
      onClose();
      resetWizard();
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Error al crear el proyecto');
    } finally {
      setIsCreating(false);
    }
  };

  const resetWizard = () => {
    setStep('template');
    setSelectedTemplate(null);
    setProjectName('');
    setCreateGitRepo(false);
    setRepoVisibility('private');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div 
        className="w-full max-w-4xl h-[600px] rounded-lg shadow-2xl flex flex-col"
        style={{ 
          backgroundColor: theme.colors.background,
          border: `1px solid ${theme.colors.borderColor}`
        }}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: theme.colors.borderColor }}
        >
          <div>
            <h2 className="text-xl font-semibold" style={{ color: theme.colors.foreground }}>
              {step === 'template' && 'Crear Nuevo Proyecto'}
              {step === 'config' && `Configurar ${selectedTemplate?.name}`}
              {step === 'creating' && 'Creando Proyecto...'}
            </h2>
            <p className="text-sm mt-1" style={{ color: theme.colors.foregroundMuted }}>
              {step === 'template' && 'Selecciona una plantilla para comenzar'}
              {step === 'config' && 'Define el nombre y opciones del proyecto'}
              {step === 'creating' && 'Por favor espera mientras creamos tu proyecto'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded hover:bg-white/10"
            style={{ color: theme.colors.foreground }}
            disabled={isCreating}
          >
            <VscClose className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {step === 'template' && (
            <div className="h-full flex flex-col">
              {/* Categories */}
              <div className="flex gap-2 px-6 py-4 border-b" style={{ borderColor: theme.colors.borderColor }}>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    style={{
                      backgroundColor: selectedCategory === cat.id 
                        ? theme.colors.accent 
                        : theme.colors.backgroundSecondary,
                      color: selectedCategory === cat.id ? '#ffffff' : theme.colors.foreground
                    }}
                  >
                    <span className="mr-2">{cat.icon}</span>
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Templates Grid */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-2 gap-4">
                  {filteredTemplates.map(template => (
                    <button
                      key={template.id}
                      onClick={() => handleSelectTemplate(template)}
                      className="p-4 rounded-lg border-2 text-left transition-all hover:scale-105"
                      style={{
                        backgroundColor: theme.colors.backgroundSecondary,
                        borderColor: theme.colors.borderColor
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-4xl">{template.icon}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold" style={{ color: theme.colors.foreground }}>
                              {template.name}
                            </h3>
                            {template.isPremium && (
                              <span className="px-2 py-0.5 text-xs rounded font-medium bg-purple-500/20 text-purple-300">
                                PREMIUM
                              </span>
                            )}
                          </div>
                          <p className="text-sm" style={{ color: theme.colors.foregroundMuted }}>
                            {template.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 'config' && selectedTemplate && (
            <div className="h-full overflow-y-auto p-6">
              <div className="max-w-2xl mx-auto space-y-6">
                {/* Project Name */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.foreground }}>
                    Nombre del Proyecto
                  </label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value.replace(/[^a-z0-9-_]/gi, ''))}
                    placeholder="mi-proyecto-web"
                    className="w-full px-4 py-3 rounded-lg border outline-none"
                    style={{
                      backgroundColor: theme.colors.backgroundTertiary,
                      borderColor: theme.colors.borderColor,
                      color: theme.colors.foreground
                    }}
                    autoFocus
                  />
                  <p className="text-xs mt-1" style={{ color: theme.colors.foregroundMuted }}>
                    Solo letras, números, guiones y guiones bajos
                  </p>
                </div>

                {/* GitHub Integration */}
                <div className="p-4 rounded-lg border" style={{ borderColor: theme.colors.borderColor }}>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium" style={{ color: theme.colors.foreground }}>
                        Crear repositorio en GitHub
                      </h4>
                      <p className="text-sm" style={{ color: theme.colors.foregroundMuted }}>
                        Inicializa Git y sube el proyecto a un nuevo repositorio
                      </p>
                    </div>
                    <button
                      onClick={() => setCreateGitRepo(!createGitRepo)}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        createGitRepo ? 'bg-blue-500' : 'bg-gray-600'
                      }`}
                    >
                      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                        createGitRepo ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>

                  {createGitRepo && (
                    <div className="mt-4 space-y-3">
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.foreground }}>
                          Visibilidad del repositorio
                        </label>
                        <div className="flex gap-3">
                          <button
                            onClick={() => setRepoVisibility('public')}
                            className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                              repoVisibility === 'public' ? 'border-blue-500' : ''
                            }`}
                            style={{
                              backgroundColor: theme.colors.backgroundSecondary,
                              borderColor: repoVisibility === 'public' ? theme.colors.accent : theme.colors.borderColor
                            }}
                          >
                            <div className="font-medium mb-1" style={{ color: theme.colors.foreground }}>
                              🌍 Público
                            </div>
                            <div className="text-xs" style={{ color: theme.colors.foregroundMuted }}>
                              Cualquiera puede ver este repositorio
                            </div>
                          </button>
                          <button
                            onClick={() => setRepoVisibility('private')}
                            className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                              repoVisibility === 'private' ? 'border-blue-500' : ''
                            }`}
                            style={{
                              backgroundColor: theme.colors.backgroundSecondary,
                              borderColor: repoVisibility === 'private' ? theme.colors.accent : theme.colors.borderColor
                            }}
                          >
                            <div className="font-medium mb-1" style={{ color: theme.colors.foreground }}>
                              🔒 Privado
                            </div>
                            <div className="text-xs" style={{ color: theme.colors.foregroundMuted }}>
                              Solo tú puedes ver este repositorio
                            </div>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Preview */}
                <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: theme.colors.backgroundSecondary }}>
                  <h4 className="text-sm font-medium mb-2" style={{ color: theme.colors.foregroundMuted }}>
                    Vista previa
                  </h4>
                  <div className="space-y-2 text-sm" style={{ color: theme.colors.foreground }}>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{selectedTemplate.icon}</span>
                      <div>
                        <div className="font-medium">{selectedTemplate.name}</div>
                        <div className="text-xs" style={{ color: theme.colors.foregroundMuted }}>
                          {projectName || 'mi-proyecto'}
                        </div>
                      </div>
                    </div>
                    {createGitRepo && (
                      <div className="mt-3 pt-3 border-t" style={{ borderColor: theme.colors.borderColor }}>
                        <div className="flex items-center gap-2 text-xs" style={{ color: theme.colors.foregroundMuted }}>
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                          </svg>
                          <span>Se creará repositorio {repoVisibility === 'private' ? 'privado' : 'público'} en GitHub</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 'creating' && (
            <div className="h-full flex flex-col items-center justify-center p-6">
              <VscLoading className="w-16 h-16 animate-spin mb-6" style={{ color: theme.colors.accent }} />
              <h3 className="text-xl font-semibold mb-2" style={{ color: theme.colors.foreground }}>
                Creando tu proyecto...
              </h3>
              <p className="text-sm text-center max-w-md" style={{ color: theme.colors.foregroundMuted }}>
                Estamos configurando {selectedTemplate?.name} con todas las dependencias necesarias.
                Esto puede tomar unos momentos.
              </p>
              <div className="mt-6 space-y-2 text-sm" style={{ color: theme.colors.foregroundMuted }}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span>Ejecutando comandos de instalación...</span>
                </div>
                {createGitRepo && (
                  <>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                      <span>Creando repositorio en GitHub...</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                      <span>Inicializando Git y haciendo commit inicial...</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {step !== 'creating' && (
          <div 
            className="flex items-center justify-between px-6 py-4 border-t"
            style={{ borderColor: theme.colors.borderColor }}
          >
            <button
              onClick={step === 'config' ? () => setStep('template') : onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{
                backgroundColor: theme.colors.backgroundSecondary,
                color: theme.colors.foreground
              }}
            >
              {step === 'config' ? '← Atrás' : 'Cancelar'}
            </button>

            {step === 'config' && (
              <button
                onClick={handleCreateProject}
                disabled={!projectName.trim() || isCreating}
                className="px-6 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: theme.colors.accent,
                  color: '#ffffff'
                }}
              >
                {isCreating ? 'Creando...' : 'Crear Proyecto'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

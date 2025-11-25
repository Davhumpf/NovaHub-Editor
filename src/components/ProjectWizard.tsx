"use client";

import React, { useMemo, useState } from 'react';
import { VscClose, VscLoading } from 'react-icons/vsc';
import { useTheme } from '@/contexts/ThemeContext';
import { useEditorStore, type FileItem } from '@/store/useEditorStore';

interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'frontend' | 'backend' | 'fullstack' | 'mobile';
  isPremium: boolean;
}

interface ProjectWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (projectPath: string) => void;
}

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  text: string;
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
  },
  {
    id: 'nextjs',
    name: 'Next.js 14',
    description: 'Next.js con App Router y TypeScript',
    icon: '▲',
    category: 'frontend',
    isPremium: false,
  },
  {
    id: 'vite-vue',
    name: 'Vue 3 + Vite',
    description: 'Vue 3 con Vite y Composition API',
    icon: '💚',
    category: 'frontend',
    isPremium: false,
  },
  {
    id: 'html-css-js',
    name: 'HTML/CSS/JS',
    description: 'Estructura básica con HTML, CSS y JavaScript',
    icon: '🌐',
    category: 'frontend',
    isPremium: false,
  },

  // BACKEND
  {
    id: 'express',
    name: 'Express.js',
    description: 'API en Node.js con Express y TypeScript',
    icon: '🟢',
    category: 'backend',
    isPremium: false,
  },
  {
    id: 'django',
    name: 'Django',
    description: 'Proyecto básico de Django listo para expandir',
    icon: '🐍',
    category: 'backend',
    isPremium: false,
  },
  {
    id: 'fastapi',
    name: 'FastAPI',
    description: 'API con FastAPI y SQLAlchemy (Premium)',
    icon: '⚡',
    category: 'backend',
    isPremium: true,
  },

  // FULLSTACK
  {
    id: 'mern',
    name: 'MERN Stack',
    description: 'MongoDB + Express + React + Node (Premium)',
    icon: '📦',
    category: 'fullstack',
    isPremium: true,
  },

  // MOBILE
  {
    id: 'react-native',
    name: 'React Native',
    description: 'App móvil con Expo (Premium)',
    icon: '📱',
    category: 'mobile',
    isPremium: true,
  },
];

const categories = [
  { id: 'all', name: 'Todas', icon: '✨' },
  { id: 'frontend', name: 'Frontend', icon: '🎨' },
  { id: 'backend', name: 'Backend', icon: '🛠️' },
  { id: 'fullstack', name: 'FullStack', icon: '🌐' },
  { id: 'mobile', name: 'Mobile', icon: '📱' },
];

const languageFromPath = (path: string): string => {
  const ext = path.split('.').pop()?.toLowerCase();
  const map: Record<string, string> = {
    js: 'javascript',
    jsx: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    vue: 'vue',
    py: 'python',
    html: 'html',
    css: 'css',
    json: 'json',
    md: 'markdown',
    mjs: 'javascript',
    cjs: 'javascript',
  };
  return map[ext ?? ''] ?? 'plaintext';
};

const createFile = (name: string, folder: string, content: string): FileItem => {
  const cleanFolder = folder.replace(/^\/+|\/+$/g, '');
  const path = cleanFolder ? `${cleanFolder}/${name}` : name;
  return {
    id: `local-${path}`,
    name,
    path,
    content,
    language: languageFromPath(name),
    lastModified: new Date(),
    isDirty: false,
  };
};

const generateTemplateFiles = (templateId: string, projectName: string): FileItem[] => {
  const files: FileItem[] = [];

  switch (templateId) {
    case 'vite-react': {
      files.push(
        createFile('package.json', '', `{
  "name": "${projectName}",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.0",
    "typescript": "^5.2.0",
    "vite": "^5.0.0"
  }
}`),
        createFile('tsconfig.json', '', `{
  "compilerOptions": {
    "target": "ESNext",
    "useDefineForClassFields": true,
    "lib": ["DOM", "DOM.Iterable", "ESNext"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "Bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}`),
        createFile('tsconfig.node.json', '', `{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}`),
        createFile('vite.config.ts', '', `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});
`),
        createFile('index.html', '', `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${projectName}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`),
        createFile('.gitignore', '', `node_modules
.dist
.vite
.env
`),
        createFile('src/main.tsx', '', `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
`),
        createFile('src/App.tsx', '', `import './App.css';

function App() {
  return (
    <div className="App">
      <h1>¡Hola desde ${projectName}!</h1>
      <p>Bienvenido a tu nuevo proyecto React + Vite.</p>
    </div>
  );
}

export default App;
`),
        createFile('src/App.css', '', `.App {
  min-height: 100vh;
  display: grid;
  place-items: center;
  gap: 1rem;
  font-family: 'Inter', system-ui, sans-serif;
  background: radial-gradient(circle at 20% 20%, #0bd18a22, transparent 25%),
    radial-gradient(circle at 80% 0%, #22a7f022, transparent 25%),
    #0b1220;
  color: #e9f5ff;
}
`),
        createFile('src/index.css', '', `:root {
  color-scheme: light dark;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
}
`),
      );
      break;
    }
    case 'nextjs': {
      files.push(
        createFile('package.json', '', `{
  "name": "${projectName}",
  "private": true,
  "version": "0.0.1",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "14.0.0",
    "react": "18.2.0",
    "react-dom": "18.2.0"
  },
  "devDependencies": {
    "typescript": "^5.2.0"
  }
}`),
        createFile('next.config.js', '', `/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
};

module.exports = nextConfig;
`),
        createFile('tsconfig.json', '', `{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": false,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}`),
        createFile('.gitignore', '', `.next
node_modules
.env
.DS_Store
`),
        createFile('src/app/layout.tsx', '', `import type { ReactNode } from 'react';
import './globals.css';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
`),
        createFile('src/app/page.tsx', '', `export default function Page() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex flex-col items-center justify-center">
      <h1 className="text-3xl font-semibold">${projectName}</h1>
      <p className="mt-3 text-slate-300">Proyecto Next.js listo para editar.</p>
    </main>
  );
}
`),
        createFile('src/app/globals.css', '', `* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body { font-family: system-ui, -apple-system, 'Inter', sans-serif; }
`),
      );
      break;
    }
    case 'vite-vue': {
      files.push(
        createFile('package.json', '', `{
  "name": "${projectName}",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "vue": "^3.4.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.0.0",
    "typescript": "^5.2.0",
    "vite": "^5.0.0"
  }
}`),
        createFile('vite.config.ts', '', `import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
});
`),
        createFile('index.html', '', `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${projectName}</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
`),
        createFile('src/main.ts', '', `import { createApp } from 'vue';
import App from './App.vue';
import './style.css';

createApp(App).mount('#app');
`),
        createFile('src/App.vue', '', `<template>
  <section class="hero">
    <h1>Hola desde ${projectName}</h1>
    <p>Tu plantilla Vue 3 + Vite está lista.</p>
  </section>
</template>

<style scoped>
.hero {
  min-height: 100vh;
  display: grid;
  place-items: center;
  gap: 0.75rem;
  background: radial-gradient(circle at 30% 30%, #2dd4bf22, transparent 30%), #0f172a;
  color: #e2f3ff;
  font-family: 'Inter', system-ui, sans-serif;
}
</style>
`),
        createFile('src/style.css', '', `:root { color-scheme: dark; }
body { margin: 0; }
`),
      );
      break;
    }
    case 'html-css-js': {
      files.push(
        createFile('index.html', '', `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${projectName}</title>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <main class="container">
      <h1>${projectName}</h1>
      <p>Proyecto base listo para HTML, CSS y JS.</p>
      <button id="action">Presiona aquí</button>
    </main>
    <script src="script.js"></script>
  </body>
</html>
`),
        createFile('style.css', '', `* { box-sizing: border-box; }
body {
  margin: 0;
  font-family: 'Inter', system-ui, sans-serif;
  background: linear-gradient(135deg, #0ea372 0%, #0a192f 100%);
  color: #f1f5f9;
}
.container {
  min-height: 100vh;
  display: grid;
  place-items: center;
  gap: 1rem;
}
button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 12px;
  background: #10b981;
  color: #0b1220;
  font-weight: 600;
  cursor: pointer;
}
button:hover { filter: brightness(1.05); }
`),
        createFile('script.js', '', "const button = document.getElementById('action');\nbutton?.addEventListener('click', () => {\n  alert('¡Listo para construir!');\n});\n"),
        createFile('README.md', '', `# ${projectName}

Proyecto base con HTML, CSS y JavaScript.
`),
      );
      break;
    }
    case 'express': {
      files.push(
        createFile('package.json', '', `{
  "name": "${projectName}",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "ts-node src/index.ts",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "express": "^4.19.0"
  },
  "devDependencies": {
    "typescript": "^5.2.0",
    "ts-node": "^10.9.1"
  }
}`),
        createFile('tsconfig.json', '', `{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "Node",
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "skipLibCheck": true,
    "outDir": "dist"
  },
  "include": ["src"]
}`),
        createFile('.gitignore', '', `node_modules
dist
.env
`),
        createFile('src/index.ts', '', `import express from 'express';
import routes from './routes';

const app = express();
app.use(express.json());
app.use('/api', routes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Servidor listo en http://localhost:' + PORT);
});
`),
        createFile('src/routes/index.ts', '', `import { Router } from 'express';

const router = Router();

router.get('/', (_req, res) => {
  res.json({ message: 'API de Express funcionando' });
});

export default router;
`),
      );
      break;
    }
    case 'django': {
      files.push(
        createFile('manage.py', '', `#!/usr/bin/env python
import os
import sys

if __name__ == "__main__":
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "project.settings")
    from django.core.management import execute_from_command_line
    execute_from_command_line(sys.argv)
`),
        createFile('requirements.txt', '', `Django>=4.2
`),
        createFile('.gitignore', '', `__pycache__
*.pyc
.env
.db.sqlite3
`),
        createFile('project/__init__.py', '', ''),
        createFile('project/settings.py', '', `from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
SECRET_KEY = "dev-key"
DEBUG = True
ALLOWED_HOSTS: list[str] = []

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "project.urls"
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "project.wsgi.application"
DATABASES = {"default": {"ENGINE": "django.db.backends.sqlite3", "NAME": BASE_DIR / "db.sqlite3"}}
AUTH_PASSWORD_VALIDATORS = []
LANGUAGE_CODE = "es-es"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True
STATIC_URL = "static/"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
`),
        createFile('project/urls.py', '', `from django.contrib import admin
from django.urls import path

urlpatterns = [
    path("admin/", admin.site.urls),
]
`),
        createFile('project/wsgi.py', '', `import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "project.settings")
application = get_wsgi_application()
`),
      );
      break;
    }
    default:
      break;
  }

  return files;
};

export default function ProjectWizard({ isOpen, onClose, onProjectCreated }: ProjectWizardProps) {
  const theme = useTheme();
  const store = useEditorStore();
  const [step, setStep] = useState<'template' | 'config' | 'creating'>('template');
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);
  const [projectName, setProjectName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const filteredTemplates = useMemo(
    () =>
      PROJECT_TEMPLATES.filter(
        (template) => selectedCategory === 'all' || template.category === selectedCategory,
      ),
    [selectedCategory],
  );

  const pushToast = (type: ToastMessage['type'], text: string) => {
    const toast: ToastMessage = { id: `${Date.now()}`, type, text };
    setToasts((prev) => [...prev, toast]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== toast.id)), 3200);
  };

  const resetWizard = () => {
    setStep('template');
    setSelectedTemplate(null);
    setProjectName('');
  };

  const handleSelectTemplate = (template: ProjectTemplate) => {
    setSelectedTemplate(template);
    setStep('config');
  };

  const handleCreateProject = async () => {
    const userIsPremium = false;
    if (!projectName.trim()) {
      pushToast('error', 'Ingresa un nombre para el proyecto');
      return;
    }
    if (!selectedTemplate) {
      pushToast('error', 'Selecciona una plantilla');
      return;
    }
    if (selectedTemplate.isPremium && !userIsPremium) {
      pushToast('error', 'Esta plantilla requiere Novahub Premium');
      return;
    }

    setIsCreating(true);
    setStep('creating');

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const files = generateTemplateFiles(selectedTemplate.id, projectName);

      if (!files.length) {
        throw new Error('No se generaron archivos');
      }

      store.setWorkspaceFiles(files, projectName);
      files.forEach((file) => store.addFile(file));
      const mainFile = files.find((f) => f.path.includes('App') || f.path.endsWith('index.html'));
      if (mainFile) {
        store.openFile(mainFile);
      }

      onProjectCreated(projectName);
      onClose();
      pushToast('success', `✅ Proyecto "${projectName}" creado con ${selectedTemplate.name}`);
      resetWizard();
    } catch (error) {
      console.error('Error al crear el proyecto', error);
      pushToast('error', 'Error al crear el proyecto');
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div
        className="w-full max-w-4xl h-[620px] rounded-lg shadow-2xl flex flex-col"
        style={{
          backgroundColor: theme.colors.background,
          border: `1px solid ${theme.colors.borderColor}`,
        }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: theme.colors.borderColor }}>
          <div>
            <h2 className="text-xl font-semibold" style={{ color: theme.colors.foreground }}>
              {step === 'template' && 'Crear Nuevo Proyecto'}
              {step === 'config' && `Configurar ${selectedTemplate?.name}`}
              {step === 'creating' && 'Creando Proyecto...'}
            </h2>
            <p className="text-sm mt-1" style={{ color: theme.colors.foregroundMuted }}>
              {step === 'template' && 'Selecciona una plantilla para comenzar'}
              {step === 'config' && 'Define el nombre y opciones del proyecto'}
              {step === 'creating' && 'Generando archivos en tu espacio local'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded hover:bg-white/10"
            style={{ color: theme.colors.foreground }}
            disabled={isCreating}
            aria-label="Cerrar asistente"
          >
            <VscClose className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden">
          {step === 'template' && (
            <div className="h-full flex flex-col">
              <div className="flex gap-2 px-6 py-4 border-b" style={{ borderColor: theme.colors.borderColor }}>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    style={{
                      backgroundColor:
                        selectedCategory === cat.id
                          ? theme.colors.accent
                          : theme.colors.backgroundSecondary,
                      color: selectedCategory === cat.id ? '#ffffff' : theme.colors.foreground,
                    }}
                  >
                    <span className="mr-2">{cat.icon}</span>
                    {cat.name}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-2 gap-4">
                  {filteredTemplates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => handleSelectTemplate(template)}
                      className="p-4 rounded-lg border-2 text-left transition-all hover:scale-105"
                      style={{
                        backgroundColor: theme.colors.backgroundSecondary,
                        borderColor: theme.colors.borderColor,
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
                      color: theme.colors.foreground,
                    }}
                    autoFocus
                  />
                  <p className="text-xs mt-1" style={{ color: theme.colors.foregroundMuted }}>
                    Solo letras, números, guiones y guiones bajos
                  </p>
                </div>

                <div className="p-4 rounded-lg border" style={{ borderColor: theme.colors.borderColor }}>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      disabled
                      title="Esta función estará disponible próximamente"
                      className="h-4 w-4"
                    />
                    <span className="text-sm" style={{ color: theme.colors.foregroundMuted }}>
                      Crear repositorio en GitHub (Próximamente)
                    </span>
                  </div>
                </div>

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
                    {selectedTemplate.isPremium && (
                      <p className="text-xs text-purple-300">Plantilla Premium - requiere suscripción</p>
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
                Estamos generando la estructura de {selectedTemplate?.name}. Los archivos aparecerán en tu explorador en segundos.
              </p>
              <div className="mt-6 space-y-2 text-sm" style={{ color: theme.colors.foregroundMuted }}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span>Generando archivos...</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  <span>Aplicando configuración inicial...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {step !== 'creating' && (
          <div className="flex items-center justify-between px-6 py-4 border-t" style={{ borderColor: theme.colors.borderColor }}>
            <button
              onClick={step === 'config' ? () => setStep('template') : onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{
                backgroundColor: theme.colors.backgroundSecondary,
                color: theme.colors.foreground,
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
                  color: '#ffffff',
                }}
              >
                {isCreating ? 'Creando...' : 'Crear Proyecto'}
              </button>
            )}
          </div>
        )}
      </div>

      <div className="fixed bottom-6 right-6 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="px-4 py-3 rounded-lg shadow-lg text-sm"
            style={{
              backgroundColor:
                toast.type === 'error'
                  ? '#7f1d1d'
                  : toast.type === 'success'
                    ? '#065f46'
                    : '#1f2937',
              color: '#f8fafc',
            }}
          >
            {toast.text}
          </div>
        ))}
      </div>
    </div>
  );
}

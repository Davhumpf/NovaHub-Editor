'use client';

import { useEffect, useState } from 'react';
import { getUserProgress, markLessonComplete } from '@/utils/supabase';
import { useUserStore } from '@/store/useUserStore';
import AuthModal from '@/components/auth/AuthModal';

// Tipos para el contenido educativo
interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: string;
  content: {
    theory: string[];
    practice: {
      title: string;
      description: string;
      starter: string;
      solution: string;
    };
  };
}

interface Level {
  id: 'beginner' | 'intermediate' | 'advanced';
  title: string;
  description: string;
  icon: string;
  color: string;
  lessons: Lesson[];
}

// Contenido educativo
const educationalContent: Level[] = [
  {
    id: 'beginner',
    title: 'Principiante',
    description: 'Aprende los fundamentos de la programación web',
    icon: '🌱',
    color: 'emerald',
    lessons: [
      {
        id: 'beginner-1',
        title: 'Introducción a HTML',
        description: 'Aprende la estructura básica de una página web',
        duration: '30 min',
        content: {
          theory: [
            'HTML es el lenguaje de marcado que estructura el contenido web',
            'Las etiquetas HTML definen elementos como encabezados, párrafos e imágenes',
            'Un documento HTML tiene una estructura básica: DOCTYPE, html, head y body',
          ],
          practice: {
            title: 'Crea tu primera página web',
            description: 'Crea una página HTML simple con un título y un párrafo',
            starter: '<!-- Escribe tu código HTML aquí -->\n',
            solution: '<!DOCTYPE html>\n<html>\n  <head>\n    <title>Mi primera página</title>\n  </head>\n  <body>\n    <h1>¡Hola Mundo!</h1>\n    <p>Esta es mi primera página web.</p>\n  </body>\n</html>',
          },
        },
      },
      {
        id: 'beginner-2',
        title: 'Introducción a CSS',
        description: 'Dale estilo a tus páginas web',
        duration: '45 min',
        content: {
          theory: [
            'CSS (Cascading Style Sheets) controla la presentación visual del HTML',
            'Puedes cambiar colores, fuentes, espaciado y diseño',
            'Los selectores CSS te permiten apuntar a elementos específicos',
          ],
          practice: {
            title: 'Estiliza tu página',
            description: 'Añade CSS para cambiar el color y tamaño del texto',
            starter: '/* Escribe tu CSS aquí */\n',
            solution: 'body {\n  font-family: Arial, sans-serif;\n  background-color: #f0f0f0;\n}\n\nh1 {\n  color: #2563eb;\n  text-align: center;\n}\n\np {\n  font-size: 18px;\n  line-height: 1.6;\n}',
          },
        },
      },
      {
        id: 'beginner-3',
        title: 'Introducción a JavaScript',
        description: 'Añade interactividad a tus páginas',
        duration: '60 min',
        content: {
          theory: [
            'JavaScript es el lenguaje de programación de la web',
            'Permite crear páginas interactivas y dinámicas',
            'Puedes manipular elementos HTML y responder a eventos del usuario',
          ],
          practice: {
            title: 'Crea un botón interactivo',
            description: 'Haz que un botón muestre una alerta al hacer clic',
            starter: '// Escribe tu código JavaScript aquí\n',
            solution: 'const button = document.querySelector("button");\n\nbutton.addEventListener("click", () => {\n  alert("¡Hola! Has hecho clic en el botón");\n});',
          },
        },
      },
    ],
  },
  {
    id: 'intermediate',
    title: 'Intermedio',
    description: 'Domina frameworks modernos y herramientas',
    icon: '🚀',
    color: 'sky',
    lessons: [
      {
        id: 'intermediate-1',
        title: 'Introducción a React',
        description: 'Aprende a construir interfaces con componentes',
        duration: '90 min',
        content: {
          theory: [
            'React es una biblioteca de JavaScript para construir interfaces de usuario',
            'Los componentes son bloques de construcción reutilizables',
            'El estado (state) permite que los componentes sean dinámicos',
          ],
          practice: {
            title: 'Crea tu primer componente',
            description: 'Construye un componente de contador simple',
            starter: 'import { useState } from "react";\n\n// Escribe tu componente aquí\n',
            solution: 'import { useState } from "react";\n\nfunction Counter() {\n  const [count, setCount] = useState(0);\n\n  return (\n    <div>\n      <p>Contador: {count}</p>\n      <button onClick={() => setCount(count + 1)}>\n        Incrementar\n      </button>\n    </div>\n  );\n}\n\nexport default Counter;',
          },
        },
      },
      {
        id: 'intermediate-2',
        title: 'Estado y Props en React',
        description: 'Maneja datos en tus componentes',
        duration: '75 min',
        content: {
          theory: [
            'Props permiten pasar datos de componentes padres a hijos',
            'El estado local (useState) gestiona datos que cambian',
            'Los efectos (useEffect) ejecutan código cuando cambian las dependencias',
          ],
          practice: {
            title: 'Lista de tareas con estado',
            description: 'Crea una lista de tareas donde puedas agregar items',
            starter: 'import { useState } from "react";\n\n// Implementa una lista de tareas\n',
            solution: 'import { useState } from "react";\n\nfunction TodoList() {\n  const [todos, setTodos] = useState([]);\n  const [input, setInput] = useState("");\n\n  const addTodo = () => {\n    if (input.trim()) {\n      setTodos([...todos, input]);\n      setInput("");\n    }\n  };\n\n  return (\n    <div>\n      <input\n        value={input}\n        onChange={(e) => setInput(e.target.value)}\n        placeholder="Nueva tarea"\n      />\n      <button onClick={addTodo}>Agregar</button>\n      <ul>\n        {todos.map((todo, i) => <li key={i}>{todo}</li>)}\n      </ul>\n    </div>\n  );\n}',
          },
        },
      },
      {
        id: 'intermediate-3',
        title: 'APIs y Fetch',
        description: 'Conecta tu aplicación con servicios externos',
        duration: '60 min',
        content: {
          theory: [
            'Las APIs permiten que las aplicaciones se comuniquen con servidores',
            'Fetch es la forma moderna de hacer peticiones HTTP en JavaScript',
            'Las promesas y async/await manejan operaciones asíncronas',
          ],
          practice: {
            title: 'Obtén datos de una API',
            description: 'Usa fetch para obtener y mostrar datos de usuarios',
            starter: '// Obtén datos de https://jsonplaceholder.typicode.com/users\n',
            solution: 'async function fetchUsers() {\n  try {\n    const response = await fetch(\n      "https://jsonplaceholder.typicode.com/users"\n    );\n    const users = await response.json();\n    console.log(users);\n    return users;\n  } catch (error) {\n    console.error("Error:", error);\n  }\n}',
          },
        },
      },
    ],
  },
  {
    id: 'advanced',
    title: 'Avanzado',
    description: 'Arquitectura, optimización y mejores prácticas',
    icon: '⚡',
    color: 'purple',
    lessons: [
      {
        id: 'advanced-1',
        title: 'Next.js y Server Components',
        description: 'Renderizado del lado del servidor y optimización',
        duration: '120 min',
        content: {
          theory: [
            'Next.js es un framework de React para producción',
            'Server Components renderizan en el servidor para mejor rendimiento',
            'El enrutamiento basado en archivos simplifica la navegación',
          ],
          practice: {
            title: 'Crea una página con Server Component',
            description: 'Implementa una página que obtiene datos en el servidor',
            starter: '// app/users/page.tsx\n',
            solution: '// app/users/page.tsx\nexport default async function UsersPage() {\n  const res = await fetch(\n    "https://jsonplaceholder.typicode.com/users",\n    { cache: "no-store" }\n  );\n  const users = await res.json();\n\n  return (\n    <div>\n      <h1>Usuarios</h1>\n      <ul>\n        {users.map((user) => (\n          <li key={user.id}>{user.name}</li>\n        ))}\n      </ul>\n    </div>\n  );\n}',
          },
        },
      },
      {
        id: 'advanced-2',
        title: 'TypeScript Avanzado',
        description: 'Tipos complejos y patrones de diseño',
        duration: '90 min',
        content: {
          theory: [
            'TypeScript añade tipos estáticos a JavaScript para prevenir errores',
            'Los generics permiten crear componentes reutilizables y type-safe',
            'Los utility types transforman tipos existentes',
          ],
          practice: {
            title: 'Crea un hook genérico',
            description: 'Implementa un hook de fetch con TypeScript genérico',
            starter: '// Crea un hook useFetch<T> genérico\n',
            solution: 'function useFetch<T>(url: string) {\n  const [data, setData] = useState<T | null>(null);\n  const [loading, setLoading] = useState(true);\n  const [error, setError] = useState<Error | null>(null);\n\n  useEffect(() => {\n    fetch(url)\n      .then(res => res.json())\n      .then((data: T) => {\n        setData(data);\n        setLoading(false);\n      })\n      .catch((err: Error) => {\n        setError(err);\n        setLoading(false);\n      });\n  }, [url]);\n\n  return { data, loading, error };\n}',
          },
        },
      },
      {
        id: 'advanced-3',
        title: 'Optimización de Rendimiento',
        description: 'Técnicas para aplicaciones React rápidas',
        duration: '105 min',
        content: {
          theory: [
            'React.memo previene renderizados innecesarios de componentes',
            'useMemo y useCallback memorizan valores y funciones',
            'Code splitting y lazy loading reducen el bundle inicial',
          ],
          practice: {
            title: 'Optimiza un componente pesado',
            description: 'Usa React.memo y useMemo para optimizar rendimiento',
            starter: '// Optimiza este componente\n',
            solution: 'import { memo, useMemo } from "react";\n\nconst ExpensiveComponent = memo(({ items }) => {\n  const sortedItems = useMemo(\n    () => [...items].sort((a, b) => b.value - a.value),\n    [items]\n  );\n\n  return (\n    <ul>\n      {sortedItems.map(item => (\n        <li key={item.id}>{item.name}</li>\n      ))}\n    </ul>\n  );\n});',
          },
        },
      },
    ],
  },
];

export default function LearnPage() {
  const { user, isAuthenticated } = useUserStore();
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [showSolution, setShowSolution] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (user?.id) {
      getUserProgress(user.id).then((progress) => {
        if (progress) {
          setCompletedLessons(progress.completed_lessons || []);
        }
      });
    }
  }, [user]);

  const handleCompleteLesson = async (lessonId: string) => {
    if (user?.id) {
      const success = await markLessonComplete(user.id, lessonId);
      if (success) {
        setCompletedLessons((prev) => [...prev, lessonId]);
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-50 via-white to-zinc-50 dark:from-black dark:via-zinc-950 dark:to-black">
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          initialMode="login"
        />
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h1 className="mb-4 text-3xl font-semibold dark:text-white">
              Inicia sesión para continuar
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              Necesitas una cuenta para acceder a las lecciones
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Vista de lección individual
  if (selectedLesson && selectedLevel) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-50 via-white to-zinc-50 dark:from-black dark:via-zinc-950 dark:to-black">
        <header className="sticky top-0 z-10 border-b border-zinc-200/80 bg-white/80 backdrop-blur dark:border-zinc-800/80 dark:bg-black/60">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedLesson(null)}
                className="rounded-lg p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                ← Volver
              </button>
              <div>
                <p className="text-sm font-semibold">{selectedLesson.title}</p>
                <p className="text-xs text-zinc-500">
                  {selectedLevel.title} • {selectedLesson.duration}
                </p>
              </div>
            </div>
            <a
              href="/"
              className="rounded-full px-4 py-2 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              Inicio
            </a>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-6 py-12">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Teoría */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <h2 className="mb-4 text-xl font-semibold dark:text-white">
                  Teoría
                </h2>
                <ul className="space-y-3">
                  {selectedLesson.content.theory.map((point, idx) => (
                    <li key={idx} className="flex gap-3">
                      <span className="text-emerald-500">✓</span>
                      <span className="text-zinc-700 dark:text-zinc-300">
                        {point}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Práctica */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <h2 className="mb-2 text-xl font-semibold dark:text-white">
                  {selectedLesson.content.practice.title}
                </h2>
                <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
                  {selectedLesson.content.practice.description}
                </p>

                <div className="space-y-4">
                  <div>
                    <p className="mb-2 text-sm font-medium dark:text-white">
                      Código inicial:
                    </p>
                    <pre className="overflow-x-auto rounded-lg bg-zinc-950 p-4 text-sm text-zinc-100">
                      <code>{selectedLesson.content.practice.starter}</code>
                    </pre>
                  </div>

                  <div>
                    <button
                      onClick={() => setShowSolution(!showSolution)}
                      className="mb-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                    >
                      {showSolution ? 'Ocultar' : 'Ver'} solución
                    </button>

                    {showSolution && (
                      <div>
                        <p className="mb-2 text-sm font-medium dark:text-white">
                          Solución:
                        </p>
                        <pre className="overflow-x-auto rounded-lg bg-zinc-950 p-4 text-sm text-zinc-100">
                          <code>{selectedLesson.content.practice.solution}</code>
                        </pre>
                      </div>
                    )}
                  </div>

                  {!completedLessons.includes(selectedLesson.id) && (
                    <button
                      onClick={() => handleCompleteLesson(selectedLesson.id)}
                      className="w-full rounded-lg bg-emerald-500 px-4 py-3 font-medium text-white hover:bg-emerald-600"
                    >
                      Marcar como completada
                    </button>
                  )}

                  {completedLessons.includes(selectedLesson.id) && (
                    <div className="rounded-lg bg-emerald-500/10 px-4 py-3 text-center font-medium text-emerald-600 dark:text-emerald-400">
                      ✓ Lección completada
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Vista de lecciones de un nivel
  if (selectedLevel) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-50 via-white to-zinc-50 dark:from-black dark:via-zinc-950 dark:to-black">
        <header className="sticky top-0 z-10 border-b border-zinc-200/80 bg-white/80 backdrop-blur dark:border-zinc-800/80 dark:bg-black/60">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedLevel(null)}
                className="rounded-lg p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                ← Volver
              </button>
              <div>
                <p className="text-sm font-semibold">
                  {selectedLevel.icon} {selectedLevel.title}
                </p>
                <p className="text-xs text-zinc-500">
                  {selectedLevel.description}
                </p>
              </div>
            </div>
            <a
              href="/"
              className="rounded-full px-4 py-2 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              Inicio
            </a>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-6 py-12">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold dark:text-white">
              Lecciones de {selectedLevel.title}
            </h1>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
              Completa las lecciones a tu ritmo y practica con ejercicios
              reales
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {selectedLevel.lessons.map((lesson) => {
              const isCompleted = completedLessons.includes(lesson.id);
              return (
                <button
                  key={lesson.id}
                  onClick={() => setSelectedLesson(lesson)}
                  className="rounded-2xl border border-zinc-200 bg-white p-6 text-left shadow-sm transition-all hover:-translate-y-1 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div className="mb-3 flex items-start justify-between">
                    <h3 className="text-lg font-semibold dark:text-white">
                      {lesson.title}
                    </h3>
                    {isCompleted && (
                      <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        ✓
                      </span>
                    )}
                  </div>
                  <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-400">
                    {lesson.description}
                  </p>
                  <p className="text-xs text-zinc-500">{lesson.duration}</p>
                </button>
              );
            })}
          </div>
        </main>
      </div>
    );
  }

  // Vista principal de niveles
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 via-white to-zinc-50 dark:from-black dark:via-zinc-950 dark:to-black">
      <header className="sticky top-0 z-10 border-b border-zinc-200/80 bg-white/80 backdrop-blur dark:border-zinc-800/80 dark:bg-black/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Novahub Logo"
              className="h-9 w-9 rounded-xl object-cover shadow-lg"
            />
            <div>
              <p className="text-sm font-semibold">Aprende con Novahub</p>
              <p className="text-xs text-zinc-500">
                Tu camino hacia el desarrollo web
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="rounded-full px-4 py-2 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              Inicio
            </a>
            <a
              href="/workspace"
              className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              Workspace
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-semibold dark:text-white">
            Elige tu nivel de aprendizaje
          </h1>
          <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
            Aprende desarrollo web moderno con lecciones interactivas y
            ejercicios prácticos
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {educationalContent.map((level) => {
            const completedCount = level.lessons.filter((lesson) =>
              completedLessons.includes(lesson.id)
            ).length;
            const totalLessons = level.lessons.length;
            const progress = (completedCount / totalLessons) * 100;

            return (
              <button
                key={level.id}
                onClick={() => setSelectedLevel(level)}
                className="group rounded-3xl border border-zinc-200 bg-white p-8 text-left shadow-sm transition-all hover:-translate-y-2 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="mb-4 text-5xl">{level.icon}</div>
                <h2 className="mb-2 text-2xl font-semibold dark:text-white">
                  {level.title}
                </h2>
                <p className="mb-4 text-zinc-600 dark:text-zinc-400">
                  {level.description}
                </p>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-zinc-500">
                    {completedCount} de {totalLessons} lecciones
                  </span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {Math.round(progress)}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
}

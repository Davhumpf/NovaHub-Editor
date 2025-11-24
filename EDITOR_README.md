# NovaHub Editor - Editor de Código Web Estilo VS Code

## 🚀 Descripción

Editor de código web completo estilo VS Code/Cursor con todas las funcionalidades visuales y de interacción. Construido con Next.js 16, React 19, TypeScript, Monaco Editor y xterm.js.

## ✨ Características Principales

### 📐 Layout Completo (Exacto como VS Code)

1. **Title Bar** (Barra Superior - 35px)
   - Logo de NovaHub + nombre del archivo activo
   - Controles de ventana (minimizar, maximizar, cerrar)
   - Color: `#323233` (dark) / `#f3f3f3` (light)

2. **Activity Bar** (Barra Vertical Izquierda - 48px)
   - Explorador de archivos (`Ctrl+Shift+E`)
   - Buscar (`Ctrl+Shift+F`)
   - Control de código fuente/Git (`Ctrl+Shift+G`)
   - Ejecutar y depurar (`Ctrl+Shift+D`)
   - Extensiones (`Ctrl+Shift+X`)
   - Configuración en la parte inferior
   - Indicador visual (línea blanca) en el panel activo
   - Tooltips al hacer hover

3. **Sidebar** (Panel Lateral Redimensionable)
   - Ancho inicial: 300px
   - Ancho mínimo: 200px, máximo: 600px
   - Drag handle en el borde derecho para redimensionar
   - Contenido cambia según Activity Bar seleccionado
   - Color: `#252526` (dark) / `#f3f3f3` (light)

4. **Editor Area** (Área Principal)
   - Tabs horizontales para archivos abiertos
   - Botón X para cerrar cada tab
   - Tab activo resaltado
   - Integración completa con Monaco Editor
   - Color: `#1e1e1e` (dark) / `#ffffff` (light)

5. **Terminal Panel** (Panel Inferior Redimensionable)
   - Altura inicial: 300px
   - Altura mínima: 100px, máxima: 600px
   - Drag handle superior para redimensionar
   - Tabs para múltiples terminales (Terminal, Problemas, Salida, Consola)
   - Botón para cerrar/ocultar
   - Integración con xterm.js
   - Toggle con `Ctrl+\``

6. **Status Bar** (Barra Inferior - 22px)
   - Información en segmentos:
     * Izquierda: Branch Git, errores, warnings
     * Centro: Línea:Columna, espacios/tabs
     * Derecha: Lenguaje, codificación (UTF-8), EOL (LF/CRLF)
   - Color: `#007ACC` (azul VS Code)

### 🗂️ File Explorer (Explorador de Archivos)

#### Funcionalidades:
- Árbol de archivos expandible/colapsable
- Iconos según tipo de archivo (React, TS, JS, CSS, Python, etc.)
- Click derecho: menú contextual
  * Nuevo archivo
  * Nueva carpeta
  * Renombrar
  * Eliminar
  * Copiar ruta
- Doble click para abrir archivo
- Integración con GitHub para CRUD de archivos

#### Iconos de Archivos:
- TypeScript: 🔷 (azul)
- JavaScript: 🟨 (amarillo)
- React (.tsx/.jsx): ⚛️ (cyan)
- Python: 🐍 (azul)
- CSS/SCSS: 🎨 (azul/rosa)
- HTML: 📄 (naranja)
- JSON: {} (amarillo)
- Markdown: 📝 (gris)
- Y muchos más...

### ⌨️ Monaco Editor Integration

#### Configuración:
```typescript
{
  fontSize: 14,
  fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
  fontLigatures: true,
  minimap: { enabled: true },
  scrollbar: {
    vertical: 'auto',
    horizontal: 'auto',
    useShadows: false
  },
  suggestOnTriggerCharacters: true,
  quickSuggestions: true,
  wordWrap: 'on',
  lineNumbers: 'on',
  renderWhitespace: 'selection',
  bracketPairColorization: { enabled: true }
}
```

#### Lenguajes Soportados:
JavaScript, TypeScript, JSX, TSX, Python, Java, C++, C#, Go, Rust, PHP, Ruby, HTML, CSS, SCSS, JSON, YAML, Markdown, SQL, GraphQL, Shell, Dockerfile, y más.

### 🖥️ Terminal Integrado

#### Características:
- Múltiples terminales en tabs
- Comandos simulados:
  * `clear` - Limpiar terminal
  * `help` - Mostrar ayuda
  * `echo` - Echo text
  * `date` - Mostrar fecha actual
- Integración con xterm.js
- Tema personalizado (dark/light)
- Auto-fit al redimensionar

### 🎨 Temas (Dark/Light)

#### Dark Theme (Default):
```css
--bg-primary: #1e1e1e
--bg-secondary: #252526
--bg-tertiary: #333333
--border-color: #2d2d2d
--text-primary: #cccccc
--text-secondary: #858585
--accent: #007ACC
```

#### Light Theme:
```css
--bg-primary: #ffffff
--bg-secondary: #f3f3f3
--bg-tertiary: #e8e8e8
--border-color: #e5e5e5
--text-primary: #1e1e1e
--text-secondary: #6c6c6c
--accent: #0066b8
```

### ⌨️ Atajos de Teclado

| Atajo | Acción |
|-------|--------|
| `Ctrl+Shift+E` | Abrir/cerrar explorador de archivos |
| `Ctrl+Shift+F` | Abrir búsqueda |
| `Ctrl+Shift+G` | Abrir control de código fuente |
| `Ctrl+Shift+D` | Abrir depuración |
| `Ctrl+Shift+X` | Abrir extensiones |
| `Ctrl+\`` | Abrir/cerrar terminal |
| `Ctrl+W` | Cerrar tab activo |
| `Ctrl+S` | Guardar archivo (si integrado con GitHub) |

## 📦 Estructura de Componentes

```
src/
├── components/
│   └── editor/
│       ├── EditorLayout.tsx       # Layout principal completo
│       ├── ActivityBar.tsx        # Barra de actividades
│       ├── Sidebar.tsx            # Panel lateral redimensionable
│       ├── FileExplorer.tsx       # Explorador de archivos
│       ├── EditorTabs.tsx         # Tabs de archivos
│       ├── MonacoEditor.tsx       # Wrapper de Monaco
│       ├── Terminal.tsx           # Terminal integrado
│       ├── StatusBar.tsx          # Barra de estado
│       └── ResizeHandle.tsx       # Handle para redimensionar
├── hooks/
│   ├── useResizable.ts            # Hook para paneles redimensionables
│   └── useKeyBindings.ts          # Hook para atajos de teclado
├── types/
│   └── editor.ts                  # Tipos TypeScript
├── utils/
│   └── fileIcons.tsx              # Iconos de archivos
└── store/
    └── useEditorStore.ts          # Estado global (Zustand)
```

## 🚀 Uso

### Instalación de Dependencias

```bash
npm install xterm @xterm/addon-fit
```

### Uso Básico

```tsx
import EditorLayout from '@/components/editor/EditorLayout';

export default function EditorPage() {
  return <EditorLayout theme="dark" />;
}
```

### Acceso

El editor está disponible en:
- `/editor` - Nueva versión completa estilo VS Code
- `/workspace` - Versión original (legacy)

## 🔧 Tecnologías Utilizadas

- **Next.js 16** - Framework React
- **React 19** - Biblioteca UI
- **TypeScript 5** - Tipado estático
- **Monaco Editor** - Editor de código
- **xterm.js** - Terminal emulador
- **Zustand** - Gestión de estado
- **TailwindCSS 4** - Estilos
- **React Icons** - Iconos (VSCode icons)

## 📝 Notas de Desarrollo

### Hooks Personalizados

#### useResizable
```typescript
const sidebarResize = useResizable({
  initialSize: 300,
  minSize: 200,
  maxSize: 600,
  direction: 'horizontal',
});
```

#### useKeyBindings
```typescript
useKeyBindings([
  {
    key: 'e',
    ctrl: true,
    shift: true,
    callback: () => setActiveView('explorer'),
  },
]);
```

### Integración con GitHub

El editor se integra con el store de Zustand existente que maneja:
- Autenticación GitHub (NextAuth)
- Listado de repositorios
- Árbol de archivos
- Lectura/escritura de archivos
- Commits
- Creación/eliminación/renombrado

## 🎯 Próximas Características

- [ ] Búsqueda global en archivos
- [ ] Git integration visual
- [ ] Depurador integrado
- [ ] Sistema de extensiones
- [ ] Modo colaborativo en tiempo real
- [ ] Autocompletado con IA
- [ ] Preview de Markdown/HTML
- [ ] Diff viewer
- [ ] Minimap mejorado
- [ ] Comandos personalizados

## 🐛 Problemas Conocidos

1. El terminal es simulado (no ejecuta comandos reales)
2. Algunos atajos pueden no funcionar en ciertos navegadores
3. La búsqueda global aún no está implementada

## 📄 Licencia

Este proyecto es parte de NovaHub Editor.

## 👥 Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue o PR.

---

**Desarrollado con ❤️ por el equipo de NovaHub**

# Novahub Editor

Novahub Editor es un IDE web tipo VS Code: carga rápido, compila en entornos aislados y permite colaborar en vivo sin instalar nada.

## 🚀 Características Implementadas

### ✅ Workspace Funcional
- **Editor de código real** con Monaco Editor (mismo editor que VS Code)
- **Soporte para múltiples lenguajes**: JavaScript, TypeScript, Python, Java, C++, Go, Rust, HTML, CSS, JSON, Markdown y más
- **Sistema de archivos virtual**: Crea, edita y gestiona múltiples archivos
- **Tabs dinámicas**: Navega entre archivos abiertos fácilmente
- **Sintaxis highlighting** y autocompletado
- **Persistencia local**: Tus archivos se guardan automáticamente en localStorage

### 📚 Sistema de Documentación Dual
El botón "Docs" ahora tiene una doble funcionalidad:

1. **Historial de Documentos**:
   - Muestra los últimos 20 archivos editados
   - Ordenados por fecha de último acceso
   - Acceso rápido para reabrir archivos
   - Información detallada de cada archivo (nombre, ruta, lenguaje, fecha)

2. **Diario de Notas Personal**:
   - Crea notas rápidas para guardar ideas
   - Editor de notas con título y contenido
   - Edita y elimina notas existentes
   - Fechas de creación y modificación
   - Almacenamiento persistente local

### 🔌 Integración con GitHub (Preparada)
- Interfaz lista para conectar con GitHub OAuth
- Estructura preparada para clonar y trabajar con repositorios
- Sistema de estado para vincular cuentas
- Preparado para futura implementación de commit/push

## 📁 Estructura del Proyecto

```
NovaHub-Editor/
├── src/
│   ├── app/
│   │   ├── page.tsx           # Landing page
│   │   ├── workspace/
│   │   │   └── page.tsx       # Editor funcional con Monaco
│   │   ├── docs/
│   │   │   └── page.tsx       # Historial y notas
│   │   ├── layout.tsx         # Layout principal
│   │   └── globals.css        # Estilos globales
│   └── store/
│       └── useEditorStore.ts  # Estado global con Zustand
├── package.json
└── README.md
```

## 🛠️ Stack Tecnológico

- **Framework**: Next.js 16 (App Router) + React 19
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS v4
- **Editor**: Monaco Editor (Visual Studio Code editor)
- **Estado**: Zustand con persistencia
- **Storage**: localStorage para persistencia de datos

## 📦 Dependencias Principales

```json
{
  "dependencies": {
    "next": "16.0.3",
    "react": "19.2.0",
    "react-dom": "19.2.0",
    "@monaco-editor/react": "^4.6.0",
    "zustand": "^5.0.2",
    "localforage": "^1.10.0",
    "next-auth": "^5.0.0-beta.25",
    "@octokit/rest": "^21.0.2"
  }
}
```

## 🚦 Scripts Disponibles

```bash
npm run dev     # Inicia el servidor de desarrollo en http://localhost:3000
npm run build   # Crea una build optimizada para producción
npm start       # Inicia el servidor de producción
```

## 📖 Uso

### 1. Instalación
```bash
npm install
```

### 2. Desarrollo
```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

### 3. Navegación

- **Landing Page** (`/`): Página principal con información del proyecto
- **Workspace** (`/workspace`): Editor de código funcional
- **Docs** (`/docs`): Historial de archivos y diario de notas

## ✨ Características del Editor

### Crear Archivos
1. Haz clic en el botón "+" en el sidebar
2. Ingresa el nombre del archivo (ej: `app.js`, `index.html`)
3. Selecciona el lenguaje
4. ¡Empieza a codear!

### Gestionar Archivos
- **Abrir**: Click en el archivo en el sidebar
- **Cerrar**: Click en la "×" en la tab o en el sidebar
- **Editar**: Escribe en el editor Monaco
- **Auto-guardado**: Los cambios se guardan automáticamente

### Historial de Archivos
- Accede desde el botón "Docs" en el header
- Selecciona "Historial de archivos"
- Haz clic en cualquier archivo para reabrirlo en el workspace

### Diario de Notas
- Accede desde el botón "Docs" en el header
- Selecciona "Diario de notas"
- Crea, edita o elimina notas según necesites

## 🔮 Próximas Características

### GitHub OAuth
```bash
# Variables de entorno necesarias (futuro)
GITHUB_ID=tu_github_client_id
GITHUB_SECRET=tu_github_client_secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=tu_secret_key_generado
```

### Roadmap Técnico
- ✅ Workspace web con UI similar a VS Code
- ✅ Editor funcional con soporte multi-lenguaje
- ✅ Sistema de historial de archivos
- ✅ Diario de notas personal
- 🚧 Integración completa con GitHub OAuth
- 🚧 Clonar repositorios desde GitHub
- 🚧 Commit y push directamente desde el editor
- ⏳ Ejecutar código en workers/containers aislados
- ⏳ Compartir sesiones y presencia en tiempo real
- ⏳ Pipelines declarativos: lint, test, build
- ⏳ Terminal integrada
- ⏳ Colaboración en vivo

## 🎨 Temas y Personalización

El editor usa el tema oscuro de Monaco por defecto (VS Dark), pero puedes personalizarlo editando las opciones del editor en `/src/app/workspace/page.tsx`.

## 💾 Persistencia de Datos

Todos los datos (archivos, notas, historial) se almacenan localmente usando:
- **Zustand persist middleware**: Sincroniza el estado con localStorage
- **LocalStorage**: Almacenamiento del navegador
- **Sin backend necesario**: Todo funciona offline

**Nota**: Los datos persisten entre sesiones pero son locales al navegador. Para sincronización entre dispositivos, se implementará en futuras versiones.

## 🐛 Solución de Problemas

### El editor no carga
- Asegúrate de tener JavaScript habilitado
- Limpia el caché del navegador
- Verifica la consola para errores

### Los archivos no se guardan
- Verifica que localStorage esté habilitado
- Comprueba que no estés en modo incógnito
- Limpia el localStorage si hay datos corruptos

### Rendimiento lento
- Cierra archivos que no estés usando
- Reduce el número de tabs abiertas
- Recarga la página

## 📄 Licencia

Este proyecto está bajo licencia privada.

## 🤝 Contribuciones

Este es un proyecto en desarrollo activo. Para contribuir:
1. Crea un fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📧 Contacto

Para preguntas o sugerencias sobre Novahub Editor, abre un issue en este repositorio.

---

**Versión**: 0.1.0
**Última actualización**: 2025

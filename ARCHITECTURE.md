# 🏗️ Arquitectura Técnica - Novahub Editor

## Stack Tecnológico

### Frontend
- **Next.js 14** - Framework React con App Router
- **React 19** - Librería UI
- **TypeScript** - Tipado estático
- **Tailwind CSS 4** - Estilos utility-first
- **Monaco Editor** - Editor de código (VS Code)
- **Zustand** - State management
- **LocalForage** - Almacenamiento local persistente

### Backend / API
- **Next.js API Routes** - Endpoints serverless
- **NextAuth.js** - Autenticación OAuth
- **Octokit** - Cliente de GitHub API REST
- **GitHub OAuth** - Provider de autenticación

### Servicios Externos
- **GitHub API** - Gestión de repositorios y archivos
- **Vercel** - Hosting y deployment (recomendado)

---

## Flujo de Datos

```
┌─────────────┐
│   Usuario   │
└──────┬──────┘
       │
       │ Interacción
       ▼
┌─────────────────────────────────────────┐
│         Frontend (React/Next.js)        │
│  ┌───────────────────────────────────┐  │
│  │     Monaco Editor Component       │  │
│  │     FileTree Component            │  │
│  │     ContextMenu Component         │  │
│  └───────────────┬───────────────────┘  │
│                  │                       │
│                  │ useEditorStore        │
│                  ▼                       │
│  ┌───────────────────────────────────┐  │
│  │      Zustand Store (Global)       │  │
│  │  - openFiles                      │  │
│  │  - currentRepo                    │  │
│  │  - repoFiles                      │  │
│  └───────────────┬───────────────────┘  │
└───────────────────┼──────────────────────┘
                    │
                    │ HTTP Requests
                    ▼
┌─────────────────────────────────────────┐
│    Next.js API Routes (Serverless)      │
│  ┌───────────────────────────────────┐  │
│  │  /api/auth/[...nextauth]          │  │
│  │  /api/github/repos                │  │
│  │  /api/github/tree                 │  │
│  │  /api/github/file                 │  │
│  │  /api/github/commit               │  │
│  │  /api/github/delete               │  │
│  │  /api/github/rename               │  │
│  └───────────────┬───────────────────┘  │
│                  │                       │
│                  │ getServerSession      │
│                  ▼                       │
│  ┌───────────────────────────────────┐  │
│  │   NextAuth Session (JWT)          │  │
│  │   - accessToken (GitHub)          │  │
│  │   - user info                     │  │
│  └───────────────┬───────────────────┘  │
└───────────────────┼──────────────────────┘
                    │
                    │ Octokit Client
                    ▼
┌─────────────────────────────────────────┐
│         GitHub REST API                 │
│  - repos.listForAuthenticatedUser       │
│  - repos.getContent                     │
│  - repos.createOrUpdateFileContents     │
│  - repos.deleteFile                     │
│  - git.getTree                          │
└─────────────────────────────────────────┘
```

---

## Componentes y Responsabilidades

### 1. **Frontend Components**

#### `/src/app/workspace/page.tsx`
**Responsabilidad:** Página principal del editor

- Renderiza el layout completo (header, sidebar, editor)
- Maneja el estado de archivos abiertos
- Controla los modales (crear archivo, guardar, etc.)
- Detecta cambios no guardados
- Integra Monaco Editor

**Estado:**
```typescript
- openFiles: FileItem[]
- activeFileId: string | null
- unsavedChanges: Set<string>
- showNewFileModal: boolean
- showSaveModal: boolean
```

#### `/src/components/FileTree.tsx`
**Responsabilidad:** Árbol de archivos interactivo

- Construye estructura jerárquica de archivos/carpetas
- Maneja expansión/colapso de folders
- Implementa menú contextual (right-click)
- Modales para CRUD (crear, renombrar, eliminar)
- Refresh automático después de operaciones

**Estado:**
```typescript
- fileTree: FileTreeNode[]
- expandedFolders: Set<string>
- contextMenu: { visible, position, node }
- createFileModal: { visible, folderPath }
- renameModal: { visible, node }
- deleteModal: { visible, node }
```

#### `/src/components/ContextMenu.tsx`
**Responsabilidad:** Menú contextual reutilizable

- Posicionamiento dinámico
- Lista de opciones configurable
- Cierre al hacer click fuera
- Integración con FileTree

#### `/src/components/GitHubConnect.tsx`
**Responsabilidad:** Modal de selección de repositorio

- Lista de repositorios del usuario
- Búsqueda y filtrado
- Selección de repo
- Integración con NextAuth

#### `/src/components/Providers.tsx`
**Responsabilidad:** Wrapper de SessionProvider

- Provee contexto de autenticación
- Wrapper de NextAuth SessionProvider

---

### 2. **State Management (Zustand)**

#### `/src/store/useEditorStore.ts`

**Store Global con:**

```typescript
interface EditorState {
  // Local files
  openFiles: FileItem[]
  activeFileId: string | null
  recentFiles: FileItem[]

  // GitHub integration
  currentRepo: GitHubRepo | null
  repoFiles: GitHubFile[]
  repoFolders: GitHubFile[]
  githubRepos: GitHubRepo[]

  // Actions
  openFile(file: FileItem): void
  closeFile(fileId: string): void
  updateFileContent(fileId, content): void

  fetchRepositories(): Promise<void>
  fetchRepoTree(owner, repo, branch): Promise<void>
  fetchFileContent(owner, repo, path): Promise<GitHubFileContent>

  saveFileToGitHub(...): Promise<boolean>
  createFile(...): Promise<void>
  deleteFile(...): Promise<boolean>
  renameFile(...): Promise<boolean>
}
```

**Persistencia:**
- Usa `zustand/middleware` con `persist`
- Almacena en `localStorage`
- Clave: `novahub-editor-storage`

---

### 3. **API Routes (Backend)**

#### `/api/auth/[...nextauth]/route.ts`
**Responsabilidad:** Configuración de NextAuth

```typescript
- Provider: GitHub OAuth
- Scopes: "read:user user:email repo"
- Callbacks:
  - jwt: Almacena access_token
  - session: Pasa access_token al cliente
- Session strategy: JWT
- Max age: 30 días
```

#### `/api/github/repos/route.ts`
**Método:** `GET`
**Responsabilidad:** Lista repositorios del usuario

```typescript
GET /api/github/repos?type=all&sort=updated&per_page=100

1. Verifica sesión
2. Crea Octokit client con accessToken
3. Llama a repos.listForAuthenticatedUser()
4. Transforma y filtra datos
5. Retorna JSON
```

#### `/api/github/tree/route.ts`
**Método:** `GET`
**Responsabilidad:** Obtiene árbol completo de archivos

```typescript
GET /api/github/tree?owner=user&repo=repo&branch=main

1. Verifica sesión
2. Obtiene referencia de la rama
3. Obtiene commit SHA
4. Obtiene tree SHA
5. Llama a git.getTree() con recursive=true
6. Separa files y folders
7. Retorna estructura organizada
```

#### `/api/github/file/route.ts`
**Método:** `GET`
**Responsabilidad:** Lee contenido de un archivo

```typescript
GET /api/github/file?owner=user&repo=repo&path=src/index.js

1. Verifica sesión
2. Llama a repos.getContent()
3. Decodifica contenido de base64
4. Retorna contenido UTF-8 + metadata
```

#### `/api/github/commit/route.ts`
**Método:** `POST`
**Responsabilidad:** Crea o actualiza archivo

```typescript
POST /api/github/commit
Body: { owner, repo, path, content, message, sha?, branch? }

1. Verifica sesión
2. Obtiene rama por defecto si no se especifica
3. Codifica contenido a base64
4. Llama a repos.createOrUpdateFileContents()
5. Retorna commit info + content info
```

#### `/api/github/delete/route.ts`
**Método:** `DELETE`
**Responsabilidad:** Elimina un archivo

```typescript
DELETE /api/github/delete
Body: { owner, repo, path, message, sha, branch? }

1. Verifica sesión
2. Verifica que SHA esté presente
3. Llama a repos.deleteFile()
4. Retorna commit info
```

#### `/api/github/rename/route.ts`
**Método:** `POST`
**Responsabilidad:** Renombra archivo (copia + elimina)

```typescript
POST /api/github/rename
Body: { owner, repo, oldPath, newPath, message, sha, branch? }

1. Verifica sesión
2. Obtiene contenido del archivo antiguo
3. Crea nuevo archivo con mismo contenido
4. Elimina archivo antiguo
5. Retorna info del nuevo archivo
```

---

## Seguridad

### 1. **Autenticación**

- **OAuth 2.0** con GitHub
- Token almacenado en **JWT server-side**
- Token **nunca expuesto** al cliente
- Sesión expira después de 30 días

### 2. **Autorización**

Todas las API routes verifican:
```typescript
const session = await getServerSession(authOptions);
if (!session || !session.accessToken) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

### 3. **Secrets Management**

- Variables de entorno en `.env.local` (ignorado por git)
- En producción: Vercel Environment Variables
- **NUNCA** commitear secrets

### 4. **GitHub Permissions**

- Scope `repo`: Acceso completo a repos privados y públicos
- Usuario debe autorizar explícitamente
- Token puede ser revocado en cualquier momento

---

## Performance

### 1. **Code Splitting**

```typescript
// Monaco Editor cargado dinámicamente
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => <div>Cargando editor...</div>
});
```

### 2. **Caching**

- Zustand persiste estado en localStorage
- Árboles de archivos cacheados hasta refresh manual
- Sesión de NextAuth cacheada

### 3. **Optimizaciones**

- React 19 compiler optimizations
- Tailwind CSS purge de clases no usadas
- Next.js Image optimization
- API Routes serverless (auto-scaling)

---

## Deployment

### Vercel (Recomendado)

```bash
# 1. Conectar repo
vercel

# 2. Configurar env vars en dashboard

# 3. Deploy
vercel --prod
```

**Ventajas:**
- Auto-scaling
- Edge network
- Serverless functions
- Zero config
- Preview deployments

### Alternativas

- **Netlify:** Similar a Vercel
- **Railway:** Con soporte para containers
- **AWS Amplify:** Integración con AWS
- **Self-hosted:** Requiere Node.js 18+

---

## Monitoreo y Logs

### Development
```bash
npm run dev
# Logs en terminal
# Chrome DevTools para frontend
```

### Production
- Vercel Analytics (integrado)
- Vercel Logs (tiempo real)
- Error tracking: Sentry (opcional)
- APM: New Relic (opcional)

---

## Testing Strategy

### Unit Tests (Recomendado)
```bash
npm install --save-dev jest @testing-library/react
```

### E2E Tests (Recomendado)
```bash
npm install --save-dev playwright
```

### Manual Testing Checklist
- [ ] Login con GitHub
- [ ] Listar repositorios
- [ ] Abrir archivo
- [ ] Editar y guardar
- [ ] Crear nuevo archivo
- [ ] Renombrar archivo
- [ ] Eliminar archivo
- [ ] Cerrar sesión

---

## Escalabilidad

### Límites Actuales
- **GitHub API:** 5,000 requests/hora (authenticated)
- **Vercel Free:** 100GB bandwidth/mes
- **Archivos:** Max 100MB por archivo (GitHub API)

### Mejoras Futuras
- Implementar cache con Redis
- Rate limiting en API routes
- Paginación en lista de archivos
- Lazy loading de árbol de archivos
- WebSockets para colaboración real-time

---

## Diagrama de Secuencia - Guardar Archivo

```
Usuario    Workspace    Store    API Route    GitHub API
  │            │          │          │            │
  │──Edit────▶│          │          │            │
  │            │          │          │            │
  │──Ctrl+S──▶│          │          │            │
  │            │          │          │            │
  │            │─Modal──▶ │          │            │
  │            │          │          │            │
  │──Commit──▶│          │          │            │
  │  Message   │          │          │            │
  │            │          │          │            │
  │            │─Save────▶│          │            │
  │            │          │          │            │
  │            │          │─POST────▶│            │
  │            │          │  /commit │            │
  │            │          │          │            │
  │            │          │          │─Auth────▶  │
  │            │          │          │  Check     │
  │            │          │          │            │
  │            │          │          │──create──▶ │
  │            │          │          │  OrUpdate  │
  │            │          │          │  Contents  │
  │            │          │          │            │
  │            │          │          │◀───200────│
  │            │          │          │  Commit    │
  │            │          │          │  Info      │
  │            │          │◀───200───│            │
  │            │          │  Success │            │
  │            │◀─true───│          │            │
  │            │          │          │            │
  │◀─Success──│          │          │            │
  │  Alert    │          │          │            │
  │            │          │          │            │
```

---

## Conclusión

Esta arquitectura proporciona:

✅ **Separación de responsabilidades** clara
✅ **Seguridad** mediante OAuth y server-side tokens
✅ **Escalabilidad** con serverless functions
✅ **Performance** con code splitting y caching
✅ **Mantenibilidad** con TypeScript y componentes modulares
✅ **UX fluida** con state management reactivo

Para preguntas técnicas, consulta la documentación completa en `COMPLETE_SETUP_GUIDE.md`.

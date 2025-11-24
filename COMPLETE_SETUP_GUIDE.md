# 📚 Guía Completa - Editor VS Code Web con GitHub Integration

## 🎯 Descripción General

Este es un editor web completo tipo VS Code construido con **Next.js 14**, **NextAuth.js** y **GitHub OAuth**, que permite:

- ✅ Autenticación OAuth con GitHub
- ✅ Crear, editar y eliminar archivos en repositorios de GitHub
- ✅ Renombrar archivos directamente en GitHub
- ✅ Árbol de archivos interactivo con menú contextual
- ✅ Editor de código Monaco (el mismo de VS Code)
- ✅ Sincronización en tiempo real con GitHub
- ✅ Gestión de estado con Zustand
- ✅ Soporte para múltiples lenguajes de programación

---

## 🏗️ Arquitectura del Proyecto

```
NovaHub-Editor/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/    # Configuración NextAuth
│   │   │   │   └── route.ts           # GitHub OAuth Provider
│   │   │   └── github/                # Endpoints de GitHub API
│   │   │       ├── repos/route.ts     # GET: Listar repositorios
│   │   │       ├── tree/route.ts      # GET: Árbol de archivos
│   │   │       ├── file/route.ts      # GET: Leer archivos
│   │   │       ├── commit/route.ts    # POST: Crear/actualizar archivos
│   │   │       ├── delete/route.ts    # DELETE: Eliminar archivos
│   │   │       └── rename/route.ts    # POST: Renombrar archivos
│   │   ├── workspace/page.tsx         # Página principal del editor
│   │   ├── layout.tsx                 # Layout con SessionProvider
│   │   └── globals.css                # Estilos globales
│   ├── components/
│   │   ├── FileTree.tsx               # Árbol de archivos con CRUD
│   │   ├── ContextMenu.tsx            # Menú contextual
│   │   ├── GitHubConnect.tsx          # Modal de conexión GitHub
│   │   ├── Providers.tsx              # SessionProvider wrapper
│   │   └── ...
│   ├── store/
│   │   └── useEditorStore.ts          # Zustand store global
│   └── types/
│       └── next-auth.d.ts             # Tipos extendidos de NextAuth
├── .env.example                       # Variables de entorno template
└── package.json                       # Dependencias del proyecto
```

---

## 🚀 Configuración Inicial

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/NovaHub-Editor.git
cd NovaHub-Editor
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar GitHub OAuth App

1. Ve a [GitHub Developer Settings](https://github.com/settings/developers)
2. Click en **"New OAuth App"**
3. Completa el formulario:
   - **Application name**: `Novahub Editor`
   - **Homepage URL**: `http://localhost:3000` (desarrollo)
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. Click en **"Register application"**
5. Copia el **Client ID** y genera un **Client Secret**

### 4. Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
# GitHub OAuth Configuration
GITHUB_ID=tu_github_client_id_aqui
GITHUB_SECRET=tu_github_client_secret_aqui

# NextAuth Configuration
NEXTAUTH_SECRET=genera_un_secret_random_aqui
NEXTAUTH_URL=http://localhost:3000
```

**Para generar NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 5. Ejecutar en Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 🔐 Autenticación con GitHub

### Scopes Requeridos

El proyecto solicita los siguientes scopes de GitHub:

- `read:user` - Leer información básica del usuario
- `user:email` - Acceder al email del usuario
- `repo` - **Acceso completo a repositorios** (crear, leer, actualizar, eliminar archivos)

### Flujo de Autenticación

1. El usuario hace clic en **"Conectar GitHub"**
2. Se redirige a GitHub OAuth
3. El usuario autoriza la aplicación
4. GitHub devuelve un `access_token`
5. NextAuth almacena el token en la sesión JWT
6. El token se usa para todas las peticiones a la GitHub API

### Configuración NextAuth

**`src/app/api/auth/[...nextauth]/route.ts`**

```typescript
export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
      authorization: {
        params: {
          scope: "read:user user:email repo", // Scopes necesarios
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      // Guardar el access_token en el JWT
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      // Pasar el access_token a la sesión del cliente
      session.accessToken = token.accessToken as string;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
```

---

## 📡 Endpoints API

### 1. GET `/api/github/repos`

Obtiene la lista de repositorios del usuario autenticado.

**Query Parameters:**
- `type` - Tipo de repos: `all`, `owner`, `public`, `private`, `member` (default: `all`)
- `sort` - Ordenar por: `created`, `updated`, `pushed`, `full_name` (default: `updated`)
- `per_page` - Resultados por página (default: `100`)

**Response:**
```json
{
  "repos": [
    {
      "id": 123456,
      "name": "mi-proyecto",
      "full_name": "usuario/mi-proyecto",
      "private": false,
      "owner": { "login": "usuario", "avatar_url": "..." },
      "description": "Descripción del repo",
      "default_branch": "main",
      "language": "JavaScript"
    }
  ],
  "total": 10
}
```

### 2. GET `/api/github/tree`

Obtiene el árbol completo de archivos y carpetas de un repositorio.

**Query Parameters:**
- `owner` - Propietario del repositorio (requerido)
- `repo` - Nombre del repositorio (requerido)
- `branch` - Rama (opcional, default: rama por defecto del repo)

**Response:**
```json
{
  "branch": "main",
  "sha": "abc123...",
  "files": [
    {
      "path": "src/index.js",
      "sha": "def456...",
      "size": 1234,
      "type": "blob"
    }
  ],
  "folders": [
    {
      "path": "src",
      "sha": "ghi789...",
      "type": "tree"
    }
  ]
}
```

### 3. GET `/api/github/file`

Lee el contenido de un archivo específico.

**Query Parameters:**
- `owner` - Propietario del repositorio (requerido)
- `repo` - Nombre del repositorio (requerido)
- `path` - Ruta del archivo (requerido)
- `ref` - Referencia (branch, tag, SHA) (opcional)

**Response:**
```json
{
  "name": "index.js",
  "path": "src/index.js",
  "sha": "abc123...",
  "size": 1234,
  "content": "const app = require('express')();...",
  "url": "https://github.com/..."
}
```

### 4. POST `/api/github/commit`

Crea o actualiza un archivo en el repositorio.

**Request Body:**
```json
{
  "owner": "usuario",
  "repo": "mi-proyecto",
  "path": "src/nuevo-archivo.js",
  "content": "console.log('Hola Mundo');",
  "message": "Crear nuevo archivo",
  "sha": "abc123...",  // Opcional, requerido para actualizar
  "branch": "main"     // Opcional
}
```

**Response:**
```json
{
  "commit": {
    "sha": "xyz789...",
    "url": "https://github.com/.../commit/xyz789",
    "message": "Crear nuevo archivo"
  },
  "content": {
    "name": "nuevo-archivo.js",
    "path": "src/nuevo-archivo.js",
    "sha": "abc123...",
    "size": 27
  }
}
```

### 5. DELETE `/api/github/delete`

Elimina un archivo del repositorio.

**Request Body:**
```json
{
  "owner": "usuario",
  "repo": "mi-proyecto",
  "path": "src/archivo-viejo.js",
  "message": "Eliminar archivo obsoleto",
  "sha": "abc123...",  // Requerido
  "branch": "main"     // Opcional
}
```

**Response:**
```json
{
  "success": true,
  "commit": {
    "sha": "xyz789...",
    "url": "https://github.com/.../commit/xyz789",
    "message": "Eliminar archivo obsoleto"
  }
}
```

### 6. POST `/api/github/rename`

Renombra un archivo (lo copia al nuevo nombre y elimina el antiguo).

**Request Body:**
```json
{
  "owner": "usuario",
  "repo": "mi-proyecto",
  "oldPath": "src/old-name.js",
  "newPath": "src/new-name.js",
  "message": "Renombrar archivo",
  "sha": "abc123...",  // SHA del archivo antiguo
  "branch": "main"     // Opcional
}
```

**Response:**
```json
{
  "success": true,
  "newFile": {
    "name": "new-name.js",
    "path": "src/new-name.js",
    "sha": "def456...",
    "size": 1234
  },
  "commit": {
    "sha": "xyz789...",
    "message": "Renombrar archivo"
  }
}
```

---

## 🎨 Componentes Principales

### FileTree Component

Muestra el árbol de archivos del repositorio con:
- **Expansión/colapso de carpetas**
- **Click para abrir archivos**
- **Menú contextual (right-click)**
- **Modales para crear, renombrar y eliminar**

**Características:**
- Ordenamiento automático (carpetas primero, luego alfabético)
- Iconos por tipo de archivo
- Líneas de indentación visual
- Actualización automática después de operaciones CRUD

### Monaco Editor

El mismo editor usado en VS Code:
- Sintaxis highlighting para 30+ lenguajes
- Autocompletado inteligente
- Detección automática de lenguaje por extensión
- Atajos de teclado (Ctrl+S para guardar)
- Tema oscuro

### Context Menu

Menú contextual que aparece al hacer clic derecho:

**Para carpetas:**
- Nuevo archivo
- Copiar ruta

**Para archivos:**
- Renombrar
- Eliminar
- Copiar ruta

---

## 🗄️ Gestión de Estado (Zustand)

### EditorStore

Store global que maneja:
- Archivos abiertos en el editor
- Archivo activo actual
- Repositorio seleccionado
- Lista de archivos del repositorio
- Operaciones CRUD con GitHub

**Funciones principales:**

```typescript
// Archivos locales
openFile(file: FileItem)
closeFile(fileId: string)
updateFileContent(fileId: string, content: string)
setActiveFile(fileId: string)

// GitHub
fetchRepositories()
fetchRepoTree(owner, repo, branch)
fetchFileContent(owner, repo, path)
saveFileToGitHub(owner, repo, path, content, message, sha, branch)
createFile(owner, repo, folderPath, fileName)
deleteFile(owner, repo, path, message, sha, branch)
renameFile(owner, repo, oldPath, newPath, message, sha, branch)
```

---

## 🔒 Seguridad

### Protección de Rutas API

Todas las rutas de API verifican la autenticación:

```typescript
const session = await getServerSession(authOptions);

if (!session || !session.accessToken) {
  return NextResponse.json(
    { error: "Unauthorized" },
    { status: 401 }
  );
}
```

### Tokens

- El `access_token` de GitHub se almacena en el JWT (server-side)
- **NUNCA** se expone al cliente directamente
- Las peticiones a GitHub se hacen desde el servidor

### Variables de Entorno

- Usar `.env.local` para desarrollo (ignorado por git)
- En producción, configurar en Vercel/Netlify dashboard
- **NUNCA** commitear secrets al repositorio

---

## 🚀 Despliegue en Producción

### Vercel (Recomendado)

1. **Conecta tu repositorio a Vercel**
   ```bash
   npm install -g vercel
   vercel
   ```

2. **Configura las variables de entorno en Vercel:**
   - `GITHUB_ID`
   - `GITHUB_SECRET`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (se configura automáticamente)

3. **Actualiza GitHub OAuth App:**
   - Homepage URL: `https://tu-app.vercel.app`
   - Callback URL: `https://tu-app.vercel.app/api/auth/callback/github`

4. **Deploy:**
   ```bash
   vercel --prod
   ```

### Variables de Entorno en Producción

En Vercel Dashboard → Settings → Environment Variables:

```
GITHUB_ID=tu_client_id
GITHUB_SECRET=tu_client_secret
NEXTAUTH_SECRET=tu_secret_random
```

---

## 🧪 Testing

### Flujo de Prueba Completo

1. **Autenticación:**
   - Click en "Conectar GitHub"
   - Autorizar la aplicación
   - Verificar que aparece el username

2. **Explorar Repositorios:**
   - Click en "Explorar proyectos"
   - Seleccionar un repositorio
   - Verificar que se carga el árbol de archivos

3. **Abrir Archivo:**
   - Click en un archivo del árbol
   - Verificar que se carga el contenido
   - Verificar syntax highlighting

4. **Editar y Guardar:**
   - Modificar el contenido
   - Ctrl+S o click en "Guardar en GitHub"
   - Ingresar mensaje de commit
   - Verificar el commit en GitHub

5. **Crear Archivo:**
   - Right-click en carpeta → "Nuevo archivo"
   - Ingresar nombre
   - Verificar que se crea en GitHub

6. **Renombrar Archivo:**
   - Right-click en archivo → "Renombrar"
   - Ingresar nuevo nombre
   - Verificar que se renombra en GitHub

7. **Eliminar Archivo:**
   - Right-click en archivo → "Eliminar"
   - Confirmar eliminación
   - Verificar que se elimina de GitHub

---

## 🐛 Troubleshooting

### Error: "Unauthorized"

- Verifica que las credenciales de GitHub estén correctas en `.env.local`
- Asegúrate de que el callback URL coincida exactamente
- Revisa que los scopes incluyan `repo`

### El árbol de archivos no carga

- Verifica que el repositorio tenga archivos
- Revisa la consola del navegador para errores
- Verifica que el token tenga permisos de lectura

### Error al guardar archivos

- Verifica que tengas permisos de escritura en el repositorio
- Asegúrate de que el SHA del archivo sea correcto
- Revisa que la rama exista

### Token expirado

- Los tokens de GitHub no expiran por defecto
- Si usas fine-grained tokens, verifica la expiración
- Re-autentica para obtener un nuevo token

---

## 📝 Notas Adicionales

### Límites de la API de GitHub

- **5,000 requests/hora** para usuarios autenticados
- **60 requests/hora** para usuarios no autenticados
- Archivos de hasta **100MB** (API REST)

### Próximas Mejoras

- [ ] Soporte para carpetas (crear, renombrar, eliminar)
- [ ] Preview de imágenes y PDFs
- [ ] Búsqueda de archivos
- [ ] Git diff y historial de commits
- [ ] Colaboración en tiempo real con WebSockets
- [ ] Terminal integrada

---

## 📄 Licencia

MIT License - Libre para usar en proyectos personales y comerciales.

---

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas! Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📧 Contacto

Para preguntas o soporte, abre un issue en GitHub.

---

**¡Feliz coding! 🚀**

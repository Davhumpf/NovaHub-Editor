# 🔗 Integración de GitHub en NovaHub Editor

## 📋 Descripción

NovaHub Editor ahora incluye un sistema completo de integración con GitHub que permite a los usuarios:

- ✅ Conectar su cuenta de GitHub mediante OAuth
- ✅ Ver todos sus repositorios (públicos y privados)
- ✅ Explorar archivos y carpetas de cualquier repositorio
- ✅ Editar archivos directamente en el navegador
- ✅ Detectar cambios automáticamente
- ✅ Guardar cambios mediante commits a GitHub
- ✅ Manejar múltiples usuarios con sesiones individuales

---

## 🚀 Configuración Inicial

### 1. Crear GitHub OAuth App

1. Ve a [GitHub Developer Settings](https://github.com/settings/developers)
2. Haz clic en **"New OAuth App"**
3. Completa el formulario:
   - **Application name**: NovaHub Editor
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. Haz clic en **"Register application"**
5. Copia el **Client ID**
6. Genera y copia el **Client Secret**

### 2. Configurar Variables de Entorno

Edita el archivo `.env.local` en la raíz del proyecto:

```bash
# GitHub OAuth
GITHUB_ID=tu_client_id_aqui
GITHUB_SECRET=tu_client_secret_aqui

# NextAuth
NEXTAUTH_SECRET=k8asg42zHapxxZKn/8B9IwYmPYjgbylnBNl1d93mRkQ=
NEXTAUTH_URL=http://localhost:3000
```

### 3. Instalar Dependencias

```bash
npm install
```

### 4. Iniciar Servidor de Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

---

## 📖 Uso

### Conectar GitHub

1. Ve a `/workspace`
2. Haz clic en **"Conectar GitHub"**
3. Serás redirigido a GitHub para autorizar la aplicación
4. Acepta los permisos solicitados
5. Serás redirigido de vuelta al editor

### Explorar Repositorios

1. Después de conectar, verás una lista de tus repositorios
2. Usa la barra de búsqueda para filtrar repositorios
3. Haz clic en un repositorio para seleccionarlo
4. El árbol de archivos aparecerá en el sidebar

### Editar Archivos

1. En el sidebar, navega por el árbol de archivos
2. Haz clic en una carpeta para expandirla
3. Haz clic en un archivo para abrirlo en el editor
4. Los archivos de GitHub tienen un punto verde si tienen cambios sin guardar

### Guardar Cambios

1. Edita un archivo de GitHub
2. Aparecerá un botón **"Guardar en GitHub"** en la barra superior
3. Haz clic en el botón
4. Ingresa un mensaje de commit descriptivo
5. Haz clic en **"Guardar"**
6. Los cambios se enviarán directamente a tu repositorio en GitHub

### Cambiar de Repositorio

1. Haz clic en **"Cambiar repo"** en la barra superior
2. Selecciona otro repositorio
3. Los archivos del nuevo repositorio se cargarán automáticamente

### Desconectar GitHub

1. Haz clic en **"Cambiar repo"**
2. Haz clic en **"Desconectar"**
3. Tu sesión de GitHub se cerrará

---

## 🏗️ Arquitectura

### Frontend

```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/
│   │   │   └── route.ts          # Configuración de NextAuth
│   │   └── github/
│   │       ├── repos/route.ts    # Listar repositorios
│   │       ├── tree/route.ts     # Obtener árbol de archivos
│   │       ├── file/route.ts     # Obtener contenido de archivo
│   │       └── commit/route.ts   # Crear commits
│   ├── workspace/page.tsx        # Editor principal
│   └── layout.tsx                # Layout con SessionProvider
├── components/
│   ├── GitHubConnect.tsx         # Modal de conexión y repos
│   ├── FileTree.tsx              # Árbol de archivos
│   └── Providers.tsx             # SessionProvider wrapper
├── store/
│   └── useEditorStore.ts         # Estado global con Zustand
└── types/
    └── next-auth.d.ts            # Types extendidos de NextAuth
```

### Backend APIs

#### `/api/github/repos`
- **Método**: GET
- **Autenticación**: Requerida (NextAuth session)
- **Descripción**: Lista todos los repositorios del usuario
- **Parámetros opcionales**:
  - `type`: all, owner, public, private, member
  - `sort`: created, updated, pushed, full_name
  - `per_page`: cantidad de repos (máx 100)
  - `page`: página de resultados

#### `/api/github/tree`
- **Método**: GET
- **Autenticación**: Requerida
- **Descripción**: Obtiene el árbol de archivos de un repositorio
- **Parámetros requeridos**:
  - `owner`: dueño del repositorio
  - `repo`: nombre del repositorio
- **Parámetros opcionales**:
  - `branch`: rama (default: main/master)

#### `/api/github/file`
- **Método**: GET
- **Autenticación**: Requerida
- **Descripción**: Obtiene el contenido de un archivo específico
- **Parámetros requeridos**:
  - `owner`: dueño del repositorio
  - `repo`: nombre del repositorio
  - `path`: ruta del archivo
- **Parámetros opcionales**:
  - `ref`: rama, tag o commit SHA

#### `/api/github/commit`
- **Método**: POST
- **Autenticación**: Requerida
- **Descripción**: Crea o actualiza un archivo con un commit
- **Body requerido**:
  ```json
  {
    "owner": "username",
    "repo": "repository-name",
    "path": "src/file.js",
    "content": "contenido del archivo",
    "message": "mensaje de commit",
    "sha": "sha_del_archivo_existente (opcional)",
    "branch": "nombre_de_la_rama (opcional)"
  }
  ```

### Estado (Zustand Store)

```typescript
interface EditorState {
  // Repositorios
  githubRepos: GitHubRepo[];
  currentRepo: GitHubRepo | null;
  repoFiles: GitHubFile[];
  repoFolders: GitHubFile[];
  isLoadingRepos: boolean;
  isLoadingFiles: boolean;

  // Métodos
  fetchRepositories: () => Promise<void>;
  fetchRepoTree: (owner, repo, branch?) => Promise<void>;
  fetchFileContent: (owner, repo, path) => Promise<GitHubFileContent>;
  saveFileToGitHub: (owner, repo, path, content, message, sha?, branch?) => Promise<boolean>;
}
```

---

## 🔐 Seguridad

### Tokens de Acceso

- Los access tokens de GitHub se almacenan en la sesión del servidor (JWT)
- Nunca se exponen al cliente
- Se incluyen automáticamente en las requests a las APIs

### Permisos OAuth

La aplicación solicita los siguientes scopes:
- `read:user`: Información básica del usuario
- `user:email`: Email del usuario
- `repo`: Acceso completo a repositorios (lectura y escritura)

### Validación

- Todas las API routes validan la sesión antes de procesar requests
- Los tokens expirados redirigen automáticamente al login
- Las sesiones duran 30 días por defecto

---

## 🐛 Solución de Problemas

### Error: "Unauthorized"
- **Causa**: No has iniciado sesión o la sesión expiró
- **Solución**: Haz clic en "Conectar GitHub" nuevamente

### Error: "The redirect_uri MUST match..."
- **Causa**: La callback URL en GitHub no coincide
- **Solución**: Verifica que en GitHub esté configurada exactamente: `http://localhost:3000/api/auth/callback/github`

### Error: "Failed to fetch repositories"
- **Causa**: Token inválido o permisos insuficientes
- **Solución**: Desconecta y vuelve a conectar tu cuenta de GitHub

### Los archivos no se cargan
- **Causa**: El repositorio puede estar vacío o la rama no existe
- **Solución**: Verifica que el repositorio tenga archivos en la rama main o master

### Error al guardar: "Conflict"
- **Causa**: El archivo fue modificado en GitHub por otro usuario
- **Solución**: Cierra y vuelve a abrir el archivo para obtener la versión más reciente

---

## 🚀 Despliegue a Producción

### 1. Configurar OAuth App para Producción

1. Ve a tu OAuth App en GitHub
2. Edita la configuración:
   - **Homepage URL**: `https://tu-dominio.com`
   - **Callback URL**: `https://tu-dominio.com/api/auth/callback/github`

### 2. Variables de Entorno en Producción

Configura estas variables en tu plataforma de hosting (Vercel, Railway, etc.):

```bash
GITHUB_ID=tu_client_id_produccion
GITHUB_SECRET=tu_client_secret_produccion
NEXTAUTH_SECRET=genera_un_nuevo_secret_para_produccion
NEXTAUTH_URL=https://tu-dominio.com
```

### 3. Seguridad Adicional

- Usa HTTPS en producción (requerido por GitHub OAuth)
- Regenera NEXTAUTH_SECRET con un valor único para producción
- Configura CORS si es necesario
- Implementa rate limiting en las API routes
- Monitorea el uso de la API de GitHub para no exceder límites

---

## 📚 Recursos Adicionales

- [GitHub OAuth Documentation](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [GitHub REST API](https://docs.github.com/en/rest)
- [Octokit REST](https://octokit.github.io/rest.js/)

---

## 🤝 Contribuir

Si encuentras bugs o tienes sugerencias:
1. Abre un issue en el repositorio
2. Describe el problema o mejora
3. Si es posible, incluye capturas de pantalla

---

## 📝 Licencia

Este proyecto está bajo la licencia MIT.

---

## ✨ Características Futuras

- [ ] Crear nuevos archivos directamente en GitHub
- [ ] Eliminar archivos
- [ ] Crear y cambiar de ramas
- [ ] Ver historial de commits
- [ ] Diff visual de cambios
- [ ] Pull requests desde el editor
- [ ] Colaboración en tiempo real
- [ ] Sincronización automática de cambios

---

**¡Disfruta editando tu código directamente desde el navegador! 🎉**

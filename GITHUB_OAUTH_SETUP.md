# Configuración de GitHub OAuth App

Para conectar cuentas de GitHub en tu aplicación, necesitas crear una OAuth App en GitHub.

## Pasos para crear la GitHub OAuth App:

### 1. Accede a GitHub Developer Settings
Ve a: https://github.com/settings/developers

### 2. Crea una nueva OAuth App
- Haz clic en **"New OAuth App"**
- O si ya tienes apps, haz clic en **"New Application"**

### 3. Completa el formulario:

```
Application name: NovaHub Editor
Homepage URL: http://localhost:3000
Application description: Editor de código con integración de GitHub
Authorization callback URL: http://localhost:3000/api/auth/callback/github
```

**IMPORTANTE**: La callback URL debe ser exactamente:
- Para desarrollo: `http://localhost:3000/api/auth/callback/github`
- Para producción: `https://tu-dominio.com/api/auth/callback/github`

### 4. Obtén las credenciales
Después de crear la app, verás:
- **Client ID**: Copia este valor
- **Client Secret**: Haz clic en "Generate a new client secret" y cópialo

⚠️ **El Client Secret solo se muestra una vez. Guárdalo de manera segura.**

### 5. Configura las variables de entorno

Edita el archivo `.env.local`:

```bash
GITHUB_ID=tu_client_id_aqui
GITHUB_SECRET=tu_client_secret_aqui
```

### 6. Permisos (Scopes)

La aplicación solicitará estos permisos por defecto:
- `user`: Información básica del usuario
- `repo`: Acceso completo a repositorios públicos y privados
  - Leer archivos
  - Escribir archivos
  - Crear commits
  - Hacer push

### 7. Para Producción

Cuando despliegues a producción:
1. Crea una **nueva OAuth App** para producción (o actualiza la existente)
2. Cambia la callback URL a tu dominio de producción
3. Actualiza las variables de entorno en tu plataforma de hosting
4. Actualiza `NEXTAUTH_URL` a tu dominio de producción

## Verificación

Para verificar que la configuración está correcta:
1. Inicia el servidor: `npm run dev`
2. Ve a: http://localhost:3000/workspace
3. Haz clic en "Conectar GitHub"
4. Deberías ser redirigido a GitHub para autorizar la aplicación

## Solución de problemas

### Error: "The redirect_uri MUST match..."
- Verifica que la callback URL en GitHub sea exactamente: `http://localhost:3000/api/auth/callback/github`
- Verifica que `NEXTAUTH_URL` en `.env.local` sea: `http://localhost:3000`

### Error: "Missing GITHUB_ID or GITHUB_SECRET"
- Verifica que las variables estén definidas en `.env.local`
- Reinicia el servidor de desarrollo después de modificar `.env.local`

### La app no solicita permisos de repo
- Asegúrate de que el scope `repo` esté configurado en la configuración de NextAuth

## Referencias
- [GitHub OAuth Apps Documentation](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps)
- [NextAuth GitHub Provider](https://next-auth.js.org/providers/github)

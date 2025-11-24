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

### 5. Genera un NEXTAUTH_SECRET

NextAuth requiere un secret para firmar los tokens JWT. Genera uno con:

```bash
openssl rand -base64 32
```

O visita: https://generate-secret.vercel.app/32

### 6. Configura las variables de entorno

Edita el archivo `.env.local` (copia desde `.env.example`):

```bash
GITHUB_ID=tu_client_id_aqui
GITHUB_SECRET=tu_client_secret_aqui
NEXTAUTH_SECRET=el_secret_generado_aqui
NEXTAUTH_URL=http://localhost:3000
```

⚠️ **IMPORTANTE**:
- El archivo `.env.local` ya existe con valores de ejemplo
- Reemplaza los valores con tus credenciales reales
- NUNCA compartas este archivo ni lo subas a GitHub
- El archivo `.env.example` es seguro para compartir (no contiene credenciales)

### 7. Permisos (Scopes)

La aplicación solicitará estos permisos por defecto:
- `read:user user:email`: Información básica del usuario y email
- `repo`: Acceso completo a repositorios públicos y privados
  - Leer archivos
  - Escribir archivos
  - Crear commits
  - Hacer push

### 8. Para Producción (Vercel)

Cuando despliegues a producción en Vercel:

1. **Crea una nueva OAuth App en GitHub para producción:**
   - Ve a: https://github.com/settings/developers
   - Haz clic en "New OAuth App"
   - Completa el formulario:
     ```
     Application name: NovaHub Editor (Production)
     Homepage URL: https://tu-dominio.vercel.app
     Authorization callback URL: https://tu-dominio.vercel.app/api/auth/callback/github
     ```

2. **Configura las variables de entorno en Vercel:**
   - Ve a tu proyecto en Vercel Dashboard
   - Settings → Environment Variables
   - Agrega las siguientes variables:
     ```
     GITHUB_ID = tu_client_id_de_produccion
     GITHUB_SECRET = tu_client_secret_de_produccion
     NEXTAUTH_SECRET = el_mismo_secret_o_uno_nuevo
     NEXTAUTH_URL = https://tu-dominio.vercel.app
     ```

3. **Redeploy tu aplicación:**
   - Haz un nuevo deploy o redeploy el proyecto
   - Vercel aplicará las nuevas variables de entorno

⚠️ **IMPORTANTE para Vercel**:
- Si tienes un dominio personalizado, usa ese dominio en las URLs
- Vercel puede autodetectar `NEXTAUTH_URL`, pero es mejor configurarlo explícitamente
- Usa diferentes OAuth Apps para desarrollo y producción (por seguridad)

## Verificación

Para verificar que la configuración está correcta:
1. Inicia el servidor: `npm run dev`
2. Ve a: http://localhost:3000/workspace
3. Haz clic en "Conectar GitHub"
4. Deberías ser redirigido a GitHub para autorizar la aplicación

## Solución de problemas

### Error: "Server error - There is a problem with the server configuration"
**Causa más común**: Falta la variable `NEXTAUTH_SECRET`

**Solución**:
1. Genera un secret: `openssl rand -base64 32`
2. Agrégalo a `.env.local`:
   ```bash
   NEXTAUTH_SECRET=el_secret_generado
   ```
3. Reinicia el servidor: `npm run dev`

**En Vercel**:
- Ve a Settings → Environment Variables
- Agrega `NEXTAUTH_SECRET` con el valor generado
- Redeploy la aplicación

### Error: "The redirect_uri MUST match..."
**Causa**: La callback URL no coincide con la configurada en GitHub

**Solución**:
- Verifica que la callback URL en GitHub sea exactamente:
  - Desarrollo: `http://localhost:3000/api/auth/callback/github`
  - Producción: `https://tu-dominio.vercel.app/api/auth/callback/github`
- Verifica que `NEXTAUTH_URL` en `.env.local` sea: `http://localhost:3000`
- NO incluyas `/api/auth/callback/github` en `NEXTAUTH_URL`, solo el dominio base

### Error: "Missing GITHUB_ID or GITHUB_SECRET"
**Causa**: Las credenciales no están configuradas correctamente

**Solución**:
- Verifica que las variables estén definidas en `.env.local`
- NO dejes espacios alrededor del `=`: ✅ `GITHUB_ID=abc123` ❌ `GITHUB_ID = abc123`
- Reinicia el servidor después de modificar `.env.local`

### La app no solicita permisos de repo
**Causa**: El scope no está configurado correctamente

**Solución**:
- Verifica en `/src/app/api/auth/[...nextauth]/route.ts` que el scope sea: `read:user user:email repo`
- Si cambias el scope, los usuarios deben reautorizar la aplicación

### Error 401 en las APIs de GitHub
**Causa**: El token no se está pasando correctamente o expiró

**Solución**:
1. Cierra sesión y vuelve a iniciar sesión
2. Verifica que la sesión contenga `accessToken` en el callback
3. Revisa la consola del navegador para errores de CORS

## Referencias
- [GitHub OAuth Apps Documentation](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps)
- [NextAuth GitHub Provider](https://next-auth.js.org/providers/github)

# Guía de Despliegue en Vercel - NovaHub Editor

Esta guía te ayudará a desplegar correctamente NovaHub Editor en Vercel con autenticación OAuth de GitHub funcionando.

## Prerequisitos

- Cuenta en Vercel (https://vercel.com)
- Cuenta de GitHub con acceso a Developer Settings
- Repositorio de NovaHub Editor en GitHub

## Paso 1: Crear OAuth App de GitHub para Producción

Es **muy importante** crear una OAuth App separada para producción (no reutilices la de desarrollo).

1. **Ve a GitHub Developer Settings:**
   - https://github.com/settings/developers

2. **Crea una nueva OAuth App:**
   - Haz clic en **"New OAuth App"**

3. **Configura la aplicación:**
   ```
   Application name: NovaHub Editor (Production)
   Homepage URL: https://tu-proyecto.vercel.app
   Application description: Editor de código web con integración de GitHub
   Authorization callback URL: https://tu-proyecto.vercel.app/api/auth/callback/github
   ```

   ⚠️ **CRÍTICO**: La callback URL debe ser exactamente:
   ```
   https://tu-dominio-de-vercel.vercel.app/api/auth/callback/github
   ```

   Si tienes un dominio personalizado:
   ```
   https://tu-dominio-personalizado.com/api/auth/callback/github
   ```

4. **Guarda las credenciales:**
   - **Client ID**: Cópialo (visible siempre)
   - **Client Secret**: Haz clic en "Generate a new client secret" y cópialo
   - ⚠️ El Client Secret solo se muestra una vez, guárdalo en un lugar seguro

## Paso 2: Generar NEXTAUTH_SECRET

NextAuth requiere un secret único para firmar los tokens JWT.

**Opción 1 - Usando OpenSSL (Linux/Mac):**
```bash
openssl rand -base64 32
```

**Opción 2 - Online:**
Visita https://generate-secret.vercel.app/32

**Opción 3 - Node.js:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Copia el resultado, lo necesitarás en el siguiente paso.

## Paso 3: Importar Proyecto en Vercel

1. **Ve a Vercel Dashboard:**
   - https://vercel.com/dashboard

2. **Importa tu repositorio:**
   - Haz clic en "Add New..." → "Project"
   - Conecta tu cuenta de GitHub si no lo has hecho
   - Selecciona el repositorio de NovaHub Editor
   - Haz clic en "Import"

3. **Configura el proyecto:**
   - **Framework Preset**: Next.js (detectado automáticamente)
   - **Root Directory**: `.` (raíz del proyecto)
   - **Build Command**: `npm run build` (por defecto)
   - **Output Directory**: `.next` (por defecto)
   - **Install Command**: `npm install` (por defecto)

## Paso 4: Configurar Variables de Entorno en Vercel

**ANTES de hacer el deploy**, configura las variables de entorno:

1. En la pantalla de importación, expande **"Environment Variables"**

2. Agrega las siguientes variables **una por una**:

   | Nombre | Valor | Entorno |
   |--------|-------|---------|
   | `GITHUB_ID` | Tu Client ID de GitHub | Production, Preview, Development |
   | `GITHUB_SECRET` | Tu Client Secret de GitHub | Production, Preview, Development |
   | `NEXTAUTH_SECRET` | El secret generado en Paso 2 | Production, Preview, Development |
   | `NEXTAUTH_URL` | `https://tu-proyecto.vercel.app` | Production, Preview, Development |

   ⚠️ **IMPORTANTE**:
   - Selecciona los 3 entornos (Production, Preview, Development) para cada variable
   - NO incluyas espacios ni comillas extras
   - `NEXTAUTH_URL` debe ser la URL completa de tu dominio de Vercel

3. **Verifica que todo esté correcto:**
   ```
   ✅ GITHUB_ID = abc123def456...
   ✅ GITHUB_SECRET = xyz789uvw012...
   ✅ NEXTAUTH_SECRET = Tu4wqjYK7Lm9pQrS...
   ✅ NEXTAUTH_URL = https://tu-proyecto.vercel.app
   ```

## Paso 5: Deploy

1. Haz clic en **"Deploy"**

2. Espera a que el build termine (2-3 minutos)

3. Una vez completado, haz clic en **"Visit"** para ver tu aplicación

## Paso 6: Actualizar Callback URL si es Necesario

Después del primer deploy, Vercel te asignará una URL como:
```
https://novahub-editor-abc123.vercel.app
```

Si esta URL es diferente a la que configuraste en GitHub:

1. **Actualiza la OAuth App en GitHub:**
   - Ve a https://github.com/settings/developers
   - Selecciona tu OAuth App de producción
   - Actualiza la **Authorization callback URL**:
     ```
     https://novahub-editor-abc123.vercel.app/api/auth/callback/github
     ```

2. **Actualiza NEXTAUTH_URL en Vercel:**
   - Ve a tu proyecto en Vercel
   - Settings → Environment Variables
   - Edita `NEXTAUTH_URL` con la URL correcta
   - Haz un **Redeploy**

## Paso 7: Verificar la Configuración

1. **Visita tu aplicación:**
   ```
   https://tu-proyecto.vercel.app/workspace
   ```

2. **Haz clic en "Conectar GitHub"**

3. **Deberías ver:**
   - Redirección a GitHub
   - Página de autorización de GitHub con los permisos solicitados
   - Después de autorizar, redirección de vuelta a tu app
   - Modal con tu lista de repositorios

## Configuración de Dominio Personalizado (Opcional)

Si quieres usar un dominio personalizado:

1. **Agrega el dominio en Vercel:**
   - Ve a Settings → Domains
   - Agrega tu dominio: `editor.tudominio.com`
   - Configura los DNS según las instrucciones de Vercel

2. **Actualiza la OAuth App en GitHub:**
   - Authorization callback URL: `https://editor.tudominio.com/api/auth/callback/github`
   - Homepage URL: `https://editor.tudominio.com`

3. **Actualiza NEXTAUTH_URL en Vercel:**
   - Cambia el valor a: `https://editor.tudominio.com`
   - Haz un redeploy

## Solución de Problemas en Producción

### Error: "Server error - There is a problem with the server configuration"

**Causa**: `NEXTAUTH_SECRET` falta o está mal configurado

**Solución**:
1. Ve a Vercel Dashboard → Tu Proyecto → Settings → Environment Variables
2. Verifica que `NEXTAUTH_SECRET` esté presente y tenga un valor largo (al menos 32 caracteres)
3. Si falta, agrégalo y redeploy
4. Si existe, genera uno nuevo y actualízalo

### Error: "The redirect_uri MUST match the registered callback URL"

**Causa**: La callback URL configurada en GitHub no coincide con la URL real de Vercel

**Solución**:
1. Copia la URL exacta de tu aplicación de Vercel (ej: `https://novahub-editor-abc123.vercel.app`)
2. Ve a tu GitHub OAuth App
3. Actualiza la callback URL a:
   ```
   https://novahub-editor-abc123.vercel.app/api/auth/callback/github
   ```
4. Asegúrate de que NO haya espacios ni caracteres extra
5. Actualiza también `NEXTAUTH_URL` en Vercel con el mismo dominio base

### Error: "Failed to fetch repositories" o 401

**Causa**: El `GITHUB_SECRET` o `GITHUB_ID` son incorrectos

**Solución**:
1. Ve a GitHub OAuth App
2. Regenera el Client Secret
3. Actualiza `GITHUB_SECRET` en Vercel
4. Redeploy la aplicación

### No se muestran los repositorios después de autorizar

**Causa**: Los scopes no se solicitaron correctamente

**Solución**:
1. Revoca el acceso de la aplicación en GitHub:
   - https://github.com/settings/applications
   - Encuentra tu aplicación y revoca el acceso
2. Vuelve a autorizar desde tu app en Vercel
3. Verifica que se soliciten los permisos: `read:user`, `user:email`, `repo`

### Logs y Debugging

Para ver los logs en Vercel:
1. Ve a tu proyecto en Vercel Dashboard
2. Haz clic en la pestaña **"Deployments"**
3. Selecciona el deployment activo
4. Haz clic en **"View Function Logs"**
5. Los logs de NextAuth aparecerán aquí si hay errores

## Variables de Entorno - Resumen Final

Verifica que tengas **exactamente** estas 4 variables en Vercel:

```bash
# GitHub OAuth Credentials
GITHUB_ID=tu_client_id_de_produccion
GITHUB_SECRET=tu_client_secret_de_produccion

# NextAuth Configuration
NEXTAUTH_SECRET=secret_generado_con_openssl_o_similar
NEXTAUTH_URL=https://tu-dominio-exacto.vercel.app
```

## URLs Importantes

- **Vercel Dashboard**: https://vercel.com/dashboard
- **GitHub OAuth Apps**: https://github.com/settings/developers
- **GitHub Applications** (revocar acceso): https://github.com/settings/applications
- **Generar Secret**: https://generate-secret.vercel.app/32

## Checklist Final

Antes de considerar el despliegue completo, verifica:

- [ ] OAuth App de producción creada en GitHub
- [ ] Callback URL correcta: `https://tu-dominio.vercel.app/api/auth/callback/github`
- [ ] Las 4 variables de entorno configuradas en Vercel
- [ ] Deploy exitoso sin errores de build
- [ ] Puedes acceder a `/workspace`
- [ ] El botón "Conectar GitHub" funciona
- [ ] La autorización de GitHub muestra los scopes correctos
- [ ] Puedes ver tu lista de repositorios
- [ ] Puedes abrir archivos de un repositorio
- [ ] Puedes editar y guardar archivos

## Próximos Pasos

Una vez que tu aplicación esté funcionando en Vercel:

1. **Monitorea los logs**: Revisa regularmente los logs en Vercel para detectar errores
2. **Configura un dominio personalizado**: Mejora la experiencia del usuario
3. **Habilita Analytics**: Activa Vercel Analytics para ver el uso
4. **Configura alertas**: Configura notificaciones para errores de build o runtime

---

**¿Necesitas ayuda?** Revisa los logs en Vercel o consulta la documentación:
- [NextAuth.js Docs](https://next-auth.js.org)
- [Vercel Docs](https://vercel.com/docs)
- [GitHub OAuth Apps](https://docs.github.com/en/apps/oauth-apps)

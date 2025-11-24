# 🚀 Solución Rápida: Configurar GitHub OAuth

Si recibes el error **"Server error - There is a problem with the server configuration"**, sigue estos pasos:

## ✅ Solución en 5 Minutos

### 1. Genera un NEXTAUTH_SECRET

Ejecuta en tu terminal:
```bash
openssl rand -base64 32
```

O genera uno aquí: https://generate-secret.vercel.app/32

### 2. Crea una OAuth App en GitHub

1. Ve a: https://github.com/settings/developers
2. Haz clic en **"New OAuth App"**
3. Completa:
   - **Application name**: `NovaHub Editor Dev`
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. Haz clic en **"Register application"**
5. Copia el **Client ID**
6. Haz clic en **"Generate a new client secret"** y cópialo

### 3. Configura las Variables de Entorno

Edita el archivo `.env.local` en la raíz del proyecto:

```bash
GITHUB_ID=pega_aqui_tu_client_id
GITHUB_SECRET=pega_aqui_tu_client_secret
NEXTAUTH_SECRET=pega_aqui_el_secret_generado
NEXTAUTH_URL=http://localhost:3000
```

⚠️ **IMPORTANTE**:
- NO dejes espacios alrededor del `=`
- NO uses comillas
- Reemplaza los valores de ejemplo con tus credenciales reales

### 4. Instala Dependencias e Inicia el Servidor

```bash
npm install
npm run dev
```

### 5. Prueba la Conexión

1. Abre: http://localhost:3000/workspace
2. Haz clic en **"Conectar GitHub"**
3. Deberías ser redirigido a GitHub
4. Autoriza la aplicación
5. Deberías ver tu lista de repositorios

---

## 🚀 Para Desplegar en Vercel

### Opción A: Variables de Entorno en Vercel Dashboard

1. Ve a tu proyecto en Vercel
2. **Settings** → **Environment Variables**
3. Agrega estas 4 variables:

   | Nombre | Valor |
   |--------|-------|
   | `GITHUB_ID` | Tu Client ID |
   | `GITHUB_SECRET` | Tu Client Secret |
   | `NEXTAUTH_SECRET` | Secret generado |
   | `NEXTAUTH_URL` | `https://tu-proyecto.vercel.app` |

4. Selecciona **Production**, **Preview** y **Development** para cada una
5. Haz **Redeploy**

### Opción B: Vercel CLI (Más Rápido)

```bash
# Instala Vercel CLI si no lo tienes
npm i -g vercel

# Configura las variables de entorno
vercel env add GITHUB_ID
vercel env add GITHUB_SECRET
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL

# Redeploy
vercel --prod
```

### IMPORTANTE: Actualiza la OAuth App

1. Ve a: https://github.com/settings/developers
2. Selecciona tu OAuth App
3. Actualiza la **Authorization callback URL** a:
   ```
   https://tu-proyecto.vercel.app/api/auth/callback/github
   ```

---

## 📋 Checklist de Verificación

Marca cada ítem a medida que lo completes:

- [ ] Generé un NEXTAUTH_SECRET
- [ ] Creé una OAuth App en GitHub
- [ ] Configuré GITHUB_ID en .env.local
- [ ] Configuré GITHUB_SECRET en .env.local
- [ ] Configuré NEXTAUTH_SECRET en .env.local
- [ ] Configuré NEXTAUTH_URL en .env.local
- [ ] Reinicié el servidor (npm run dev)
- [ ] Puedo conectarme con GitHub sin errores
- [ ] Puedo ver mi lista de repositorios

### Para Producción (Vercel):
- [ ] Configuré las 4 variables de entorno en Vercel
- [ ] Actualicé la callback URL en GitHub
- [ ] Hice redeploy de la aplicación
- [ ] Probé la autenticación en producción

---

## ❌ Errores Comunes y Soluciones

### "Configuration" error persiste
- ✅ Verifica que NEXTAUTH_SECRET tenga al menos 32 caracteres
- ✅ Reinicia el servidor: Ctrl+C y luego `npm run dev`

### "redirect_uri MUST match"
- ✅ Verifica que la callback URL en GitHub termine en `/api/auth/callback/github`
- ✅ Verifica que NEXTAUTH_URL NO incluya `/api/auth/callback/github`

### "Invalid client credentials"
- ✅ Verifica que copiaste correctamente GITHUB_ID y GITHUB_SECRET
- ✅ Regenera el Client Secret en GitHub si es necesario

### No veo repositorios
- ✅ Verifica que el scope `repo` esté en la configuración de NextAuth
- ✅ Revoca acceso en https://github.com/settings/applications y vuelve a autorizar

---

## 📚 Documentación Completa

- **Configuración detallada**: Ver `GITHUB_OAUTH_SETUP.md`
- **Guía de Vercel**: Ver `VERCEL_DEPLOYMENT.md`
- **Integración completa**: Ver `README_GITHUB_INTEGRATION.md`

## 🆘 ¿Aún tienes problemas?

1. Revisa los logs de la consola del navegador (F12)
2. Revisa los logs del servidor en la terminal
3. Verifica que todas las URLs sean correctas (sin typos)
4. Asegúrate de que no haya espacios en las variables de entorno

---

**Última actualización**: 2025-11-24

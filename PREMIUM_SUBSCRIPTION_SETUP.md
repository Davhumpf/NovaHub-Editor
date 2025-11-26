# Sistema de Suscripción Premium - NovaHub Editor

## Índice
1. [Resumen](#resumen)
2. [Cambios en la Base de Datos](#cambios-en-la-base-de-datos)
3. [Componentes Creados](#componentes-creados)
4. [Pasos Pendientes](#pasos-pendientes)
5. [Cómo Probar](#cómo-probar)

---

## Resumen

Se ha implementado un sistema de suscripción premium para NovaHub Editor que permite:
- Diferenciar entre usuarios gratuitos y premium
- Simular un proceso de pago (sin procesamiento real)
- Actualizar el estado de suscripción del usuario en la base de datos
- Mostrar un botón de upgrade prominente para usuarios free
- Mostrar un indicador de estado premium para usuarios suscritos

---

## Cambios en la Base de Datos

### 1. Tabla `subscription_plans`

Se crearon dos planes en Supabase:

| ID | plan_name | description | price |
|----|-----------|-------------|-------|
| 1  | free | Plan gratuito con funciones básicas del editor | 0 |
| 2  | premium | Plan premium con funciones avanzadas: AI, extensiones, plantillas pro | 9.99 |

### 2. Tabla `users` - Nuevas Columnas

Se agregaron las siguientes columnas a la tabla `users`:

```sql
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS subscription_plan_id int8 REFERENCES public.subscription_plans(id) DEFAULT 1,
ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'active',
ADD COLUMN IF NOT EXISTS subscription_date timestamptz DEFAULT now();
```

**Descripción de campos:**
- `subscription_plan_id`: Referencia al plan actual del usuario (1=free, 2=premium)
- `subscription_status`: Estado de la suscripción ('active', 'cancelled', 'expired')
- `subscription_date`: Fecha de inicio de la suscripción actual
- `is_premium`: Campo booleano existente que se actualiza automáticamente

**Nota:** Todos los usuarios existentes se asignaron automáticamente al plan gratuito (ID=1).

---

## Componentes Creados

### 1. `PremiumButton.tsx`
**Ubicación:** `src/components/PremiumButton.tsx`

**Funcionalidad:**
- Muestra un botón atractivo de "Upgrade a Premium" para usuarios free
- Muestra un badge con corona dorada para usuarios premium
- Abre el modal de checkout al hacer clic
- Se oculta automáticamente si el usuario no está autenticado

**Props:** Ninguna

**Dependencias:**
- `useAuth` hook (pendiente de crear)
- `CheckoutModal` component
- `lucide-react` para iconos

### 2. `CheckoutModal.tsx`
**Ubicación:** `src/components/CheckoutModal.tsx`

**Funcionalidad:**
- Modal de simulación de pago con formulario completo
- Campos: Número de tarjeta, Nombre, Fecha de vencimiento, CVV
- Lista de beneficios del plan premium
- Simulación de procesamiento de 2 segundos
- Actualización automática del usuario a premium en Supabase
- Pantalla de éxito con animación
- Cierre automático después del éxito

**Props:**
```typescript
interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}
```

**Proceso de upgrade:**
1. Usuario completa el formulario
2. Se simula el procesamiento del pago (2 seg)
3. Se actualiza la BD:
   - `subscription_plan_id` = 2
   - `is_premium` = true
   - `subscription_status` = 'active'
   - `subscription_date` = fecha actual
4. Se refresca la data del usuario
5. Se muestra pantalla de éxito
6. Se cierra el modal automáticamente

---

## Pasos Pendientes

### 1. Crear o Actualizar `AuthContext`
**Archivo:** `src/contexts/AuthContext.tsx`

El contexto necesita exportar:
```typescript
interface AuthContextType {
  user: User | null;
  userPlan: SubscriptionPlan | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUserData: () => Promise<void>; // Nueva función
}
```

**Implementación de `refreshUserData`:**
```typescript
const refreshUserData = async () => {
  if (!user) return;
  
  const { data: userData, error } = await supabase
    .from('users')
    .select(`
      *,
      subscription_plans(
        id,
        plan_name,
        description,
        price
      )
    `)
    .eq('id', user.id)
    .single();
    
  if (!error && userData) {
    setUserPlan(userData.subscription_plans);
    // Actualizar otros estados según sea necesario
  }
};
```

### 2. Agregar `PremiumButton` al Layout
**Ubicación sugerida:** Header o barra superior de la aplicación

**Ejemplo de integración:**
```tsx
// En src/app/workspace/layout.tsx o src/components/Header.tsx
import { PremiumButton } from '@/components/PremiumButton';

export default function Header() {
  return (
    <header className="flex items-center justify-between p-4">
      <div className="flex items-center gap-4">
        <Logo />
        <Nav />
      </div>
      <div className="flex items-center gap-4">
        <PremiumButton /> {/* <-- Agregar aquí */}
        <UserMenu />
      </div>
    </header>
  );
}
```

### 3. Implementar Lógica de Diferenciación de Features

Ejemplos de cómo limitar features según el plan:

**Opción 1: Hook personalizado**
```typescript
// src/hooks/usePremiumFeature.ts
export function usePremiumFeature() {
  const { userPlan } = useAuth();
  const isPremium = userPlan?.plan_name === 'premium';
  
  return { isPremium };
}

// Uso en componentes:
const { isPremium } = usePremiumFeature();

if (!isPremium) {
  return <PremiumFeatureLockedMessage />;
}
```

**Opción 2: Component wrapper**
```typescript
// src/components/PremiumFeature.tsx
export function PremiumFeature({ children, fallback }: Props) {
  const { userPlan } = useAuth();
  
  if (userPlan?.plan_name !== 'premium') {
    return fallback || <UpgradePrompt />;
  }
  
  return <>{children}</>;
}

// Uso:
<PremiumFeature fallback={<UpgradeToAccessAI />}>
  <AIAssistant />
</PremiumFeature>
```

### 4. Features a Limitar por Plan

Sugerencias de features que deberían ser premium:

**Plan Free:**
- ✅ Editor básico
- ✅ File explorer
- ✅ Temas básicos
- ✅ GitHub integration (limitado)
- ✅ Terminal básico
- ❌ AI Assistant (limitado a X prompts/día)
- ❌ Extensiones avanzadas
- ❌ Plantillas premium
- ❌ Colaboración en tiempo real

**Plan Premium ($9.99/mes):**
- ✅ Todo lo del plan free
- ✅ AI Assistant ilimitado
- ✅ Extensiones premium
- ✅ Plantillas profesionales
- ✅ Colaboración en tiempo real
- ✅ Soporte prioritario
- ✅ Temas personalizados
- ✅ Exportación avanzada

---

## Cómo Probar

### 1. Verificar la Base de Datos
```sql
-- Ver planes disponibles
SELECT * FROM subscription_plans;

-- Ver usuarios y sus planes
SELECT 
  u.id,
  u.username,
  u.email,
  u.is_premium,
  sp.plan_name,
  u.subscription_status,
  u.subscription_date
FROM users u
LEFT JOIN subscription_plans sp ON u.subscription_plan_id = sp.id;
```

### 2. Probar el Flujo de Upgrade

1. **Usuario Free:**
   - Inicia sesión con un usuario existente
   - Debería ver el botón "Upgrade a Premium" con corona dorada
   
2. **Abrir Modal:**
   - Click en el botón de upgrade
   - Se abre el modal con el formulario de pago
   - Revisa los beneficios listados
   
3. **Simular Pago:**
   - Completa el formulario con datos de prueba:
     - Tarjeta: 1234 5678 9012 3456
     - Nombre: Juan Pérez
     - Fecha: 12/25
     - CVV: 123
   - Click en "Confirmar pago"
   - Ver loading de 2 segundos
   - Ver mensaje de éxito
   
4. **Verificar Premium:**
   - El modal se cierra automáticamente
   - El botón ahora muestra el badge "Premium"
   - Verificar en la BD que `is_premium` = true

### 3. Datos de Prueba

Usuarios de prueba que puedes crear:
```
Free User:
- Email: free@test.com
- subscription_plan_id: 1
- is_premium: false

Premium User:
- Email: premium@test.com
- subscription_plan_id: 2
- is_premium: true
```

---

## Notas Adicionales

### Seguridad
- ⚠️ El sistema actual es una **simulación**
- No se procesan pagos reales
- Para producción, integrar con Stripe, PayPal, etc.
- Implementar Row Level Security (RLS) en Supabase

### Mejoras Futuras
1. **Gestión de Suscripciones:**
   - Panel de usuario para ver/cancelar suscripción
   - Historial de pagos
   - Renovación automática
   - Descuentos y cupones

2. **Analytics:**
   - Tracking de conversiones
   - Tasa de upgrade
   - Retención de usuarios premium

3. **Notificaciones:**
   - Email de bienvenida a premium
   - Recordatorios de renovación
   - Alertas de próxima expiración

4. **Más Planes:**
   - Plan Team ($19.99/mes)
   - Plan Enterprise (custom pricing)
   - Descuentos anuales

### Recursos
- [Documentación de Supabase](https://supabase.com/docs)
- [Lucide Icons](https://lucide.dev/)
- [Tailwind CSS](https://tailwindcss.com/)

---

**Fecha de implementación:** Noviembre 26, 2025  
**Autor:** Sistema automatizado de desarrollo  
**Versión:** 1.0.0

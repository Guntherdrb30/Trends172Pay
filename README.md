# trends172 Pay

trends172 Pay es una **pasarela de pagos multi‑negocio** (multi‑tenant) pensada para centralizar los cobros en línea de distintos negocios —por ejemplo, e‑commerce, academias, plataformas de servicios y aplicaciones web— utilizando un único backend seguro.

En versiones posteriores, cada negocio (`MerchantApp`) podrá:

- Integrarse mediante una **API REST sencilla** y opcionalmente webhooks.
- Utilizar un **checkout alojado** en trends172 Pay.
- Ver sus cobros, comisiones y liquidaciones de manera aislada.

Y tú, como administrador root, podrás gestionar todos los negocios y sus integraciones desde un **dashboard administrativo**.

> Nota: Este repositorio está en fase inicial. La lógica de pagos real, la conexión con el banco y más módulos del dashboard se irán añadiendo en iteraciones posteriores.

---

## Stack técnico

- **Next.js 16** (App Router, React 19)
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui** (a integrar en fases siguientes)
- Despliegue orientado a **Vercel**

Toda la lógica sensible (integración con el banco, manejo de llaves, webhooks firmados) vivirá en el backend, usando variables de entorno.

---

## Estructura del proyecto

Estructura relevante a día de hoy:

```txt
app/
  layout.tsx        # Layout raíz (HTML, cabecera, pie)
  page.tsx          # Landing básica de trends172 Pay
  (public)/         # Futuras páginas públicas (checkout, docs, etc.)
  (admin)/          # Grupo de rutas admin (no usado aún)
  api/              # Rutas API públicas v1 e internas
    admin/          # Endpoints internos del dashboard root
    v1/             # API pública v1 (payment-sessions, etc.)
components/         # Componentes compartidos (UI, layout)
lib/                # Lógica compartida, servicios, stores
types/              # Tipos y modelos de dominio en TS
styles/
  globals.css       # Tailwind + estilos globales
next.config.mjs     # Configuración de Next.js
tailwind.config.ts  # Configuración de Tailwind
postcss.config.mjs  # Configuración de PostCSS
tsconfig.json       # Configuración de TypeScript
package.json        # Dependencias y scripts de proyecto
.env.example        # Variables de entorno esperadas
README.md           # Este archivo
```

Las carpetas `lib/`, `types/`, `app/api/` y `app/admin/` ya contienen:

- Modelos de dominio básicos:
  - `MerchantApp`
  - `PaymentSession`
  - `PaymentStatus`
- Stores en memoria:
  - `merchantAppStore`
  - `paymentSessionStore`
- Un helper de comisiones:
  - `calculateFees`

Todo está pensado para poder sustituir los stores en memoria por una base de datos real más adelante sin romper la API.

---

## Requisitos previos

- **Node.js 20+** (recomendado para compatibilidad con Next.js 16).
- Gestor de paquetes:
  - `npm` (incluido con Node), o
  - `pnpm` / `yarn` si prefieres (adaptando los comandos).

---

## Variables de entorno

Antes de arrancar, copia el archivo `.env.example` a `.env.local`:

```bash
cp .env.example .env.local
```

Para desarrollo básico basta con definir, al menos:

- `ROOT_DASHBOARD_TOKEN` → token para acceder al dashboard root.
- Opcionalmente `BASE_URL` → URL base usada para generar la `checkoutUrl` devuelta por la API pública (por defecto `http://localhost:3000`).

El resto de variables se irán usando cuando se integre el banco y otros servicios.

---

## Instalación y ejecución en desarrollo

### Usando npm

```bash
npm install
npm run dev
```

Luego abre en el navegador:

```text
http://localhost:3000
```

Deberías ver la landing con el mensaje:

> "trends172 Pay — Pasarela de pagos multi‑negocio"

### Usando pnpm (opcional)

Si usas `pnpm`, puedes hacer:

```bash
pnpm install
pnpm dev
```

---

## Dashboard root de administración

El dashboard administrativo está disponible bajo la ruta `/admin` y está protegido por un token de administrador.

1. Configura la variable de entorno `ROOT_DASHBOARD_TOKEN` en tu `.env.local`.
2. Arranca la app (`npm run dev` o `pnpm dev`).
3. Accede a `http://localhost:3000/admin/login` e introduce el token.

Si el token es correcto:

- Se establecerá una cookie `admin_session` con la sesión de administrador.
- El middleware de Next (`middleware.ts`) permitirá acceder al área `/admin`.

Rutas relevantes del dashboard:

- `/admin` → resumen general (Dashboard root).
- `/admin/merchants` → alta y gestión de negocios (`MerchantApp`).
- `/admin/sessions` → listado de sesiones de pago (`PaymentSession`) con filtros básicos.

---

## API pública v1

La API pública expone una primera versión bajo `/api/v1`, usando autenticación por `x-api-key` asociada a cada `MerchantApp`.

### Autenticación

- Cada negocio (`MerchantApp`) tiene una `apiKey` generada por `merchantAppStore`.
- Las peticiones a la API pública deben incluir el header:

```http
x-api-key: <API_KEY_DEL_MERCHANT>
```

Si la API key falta o no es válida, la API responde con `401`.

### Endpoints principales

1. `POST /api/v1/payment-sessions`
   - Crea una sesión de pago asociada al `MerchantApp` autenticado.
   - Body JSON mínimo:
     - `amount` (number)
     - `currency` (string)
     - `description` (string)
     - `originSystem` (string)
     - `successUrl` (string)
     - `cancelUrl` (string)
   - Campos opcionales:
     - `customerName`, `customerEmail`
     - `externalOrderId`
   - Devuelve `201` con:
     - `sessionId`
     - `checkoutUrl` (por defecto `/pay?sessionId=...` sobre `BASE_URL`).

2. `GET /api/v1/payment-sessions`
   - Lista sesiones de pago del `MerchantApp` autenticado.
   - Parámetros opcionales por query:
     - `status` (`pending | processing | paid | failed`)
     - `originSystem`
     - `fromDate` / `toDate` (ISO string)
   - Devuelve `{ sessions: [...] }` con información resumida (montos, comisiones, estado, etc.).

3. `GET /api/v1/payment-sessions/:id`
   - Obtiene el detalle de una sesión de pago por su `id`, siempre dentro del contexto del `MerchantApp` autenticado.
   - Devuelve `404` si la sesión no pertenece a ese negocio o no existe.

4. `GET /api/v1/payment-sessions/by-external/:externalOrderId`
   - Busca sesiones de pago asociadas a un `externalOrderId` concreto (por ejemplo, el ID de pedido en tu e‑commerce), filtradas por el `MerchantApp` autenticado.
   - Devuelve `{ sessions: [...] }` o `404` si no se encuentra ninguna sesión para ese `externalOrderId`.

Con estos endpoints ya puedes empezar a integrar trends172 Pay desde aplicaciones externas usando sesiones de pago simuladas en memoria.

---

## Estado actual y siguientes pasos

Implementado a día de hoy:

- Modelos de dominio básicos (`MerchantApp`, `PaymentSession`, `PaymentStatus`).
- Stores en memoria (`merchantAppStore`, `paymentSessionStore`).
- Cálculo de comisiones por sesión (`calculateFees`).
- Dashboard root inicial con:
  - Login protegido por `ROOT_DASHBOARD_TOKEN`.
  - Listado de negocios y sesiones de pago.
- API pública v1 para crear y consultar sesiones de pago.

Siguientes pasos naturales:

- Persistencia en base de datos real (por ejemplo, PostgreSQL).
- Integración con el banco / proveedor de pagos.
- Webhooks firmados para notificar cambios de estado de pago.
- Mejorar el dashboard con más métricas, filtros y exportaciones.


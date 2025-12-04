# trends172 Pay

trends172 Pay es una **pasarela de pagos multi-negocio** (multi-tenant) pensada para centralizar los cobros en línea de distintos negocios —por ejemplo, e‑commerce, academias, plataformas de servicios y aplicaciones web— utilizando un único backend seguro.

En versiones posteriores, cada negocio (MerchantApp) podrá:

- Integrarse mediante una **API REST sencilla** y opcionalmente webhooks.
- Utilizar un **checkout alojado** en trends172 Pay.
- Ver sus cobros, comisiones y liquidaciones de manera aislada.

Y tú, como administrador root, podrás gestionar todos los negocios y sus integraciones desde un **dashboard administrativo**.

> Nota: Este repositorio está en fase de setup inicial. La lógica de pagos, APIs v1 y dashboard se irán añadiendo en PROMs posteriores.

---

## Stack técnico

- **Next.js 16 (App Router, React 19)**
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui** (a integrar en fases siguientes)
- Despliegue orientado a **Vercel**

Toda la lógica sensible (integración con el banco, manejo de llaves, webhooks firmados) vivirá en el backend, usando variables de entorno.

---

## Estructura inicial del proyecto

Estructura relevante a día de hoy:

```txt
app/
  layout.tsx        # Layout raíz (HTML, cabecera, pie)
  page.tsx          # Landing básica de trends172 Pay
  (public)/         # Futuras páginas públicas (checkout, docs, etc.)
  (admin)/          # Futuro dashboard root
  api/              # Futuras rutas API (pública v1 e internas)
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

En PROMs posteriores se irán poblando las carpetas `lib/`, `types/`, `app/api/`, `app/(admin)/` y `app/(public)/` con modelos de dominio, stores, servicios, APIs y páginas.

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

Rellena los valores cuando vayas a integrar con el banco y el dashboard root.  
Para el arranque en desarrollo básico, puedes dejar la mayoría vacíos.

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

> "trends172 Pay – Pasarela de pagos multi-negocio"

### Usando pnpm (opcional)

Si usas `pnpm`, puedes hacer:

```bash
pnpm install
pnpm dev
```

---

## Próximos pasos (PROM 2)

En el siguiente PROM se definirán:

- Los modelos de dominio principales:
  - `MerchantApp`
  - `PaymentSession`
  - `PaymentStatus`
- Los stores en memoria:
  - `merchantAppStore`
  - `paymentSessionStore`
- Un helper para cálculo de comisiones:
  - `calculateFees`

Esto permitirá empezar a trabajar con datos simulados antes de integrar una base de datos real.


# EDM Hardware
-Página Web: [edm-hardware.vercel.app/](https://edm-hardware.vercel.app/)

-Proyecto de [Trello](https://trello.com/b/WPKPxOpJ/edm-hardware-group-inc)

**Aclaración**: El Usuario **"CRUFTY"** y **"Elías Mateo"** son **Elías Mateo**


Proyecto de tienda de venta de componentes de hardware. Usa React + TypeScript, Vite y TailwindCSS. Incluye un catálogo consultado desde la base de datos, un carrito, un Constructor PC y un panel de administración.

## Tabla de contenidos

- [Descripción rápida](#descripción-rápida)
- [Características principales](#características-principales)
- [Arquitectura y tecnologías](#arquitectura-y-tecnologías)
- [Cómo ejecutar (desarrollo)](#cómo-ejecutar-desarrollo)
- [Autenticación](#autenticación)
- [Pagos (Stripe)](#pagos-stripe)
- [Panel de administración](#panel-de-administración)
- [Constructor PC](#constructor-pc)
- [Archivos relevantes](#archivos-relevantes)
- [Pruebas rápidas](#pruebas-rápidas-try-it)
- [Créditos y roles](#créditos-y-roles)
- [Contribuir](#contribuir)
- [Estructura](#Estructura)

## Descripción rápida

Proyecto de tienda de venta de componentes de hardware. Diseñado para explorar, filtrar y preparar una PC personalizada con integración de pagos y panel de administración.

## Características principales

- Catálogo de componentes (consultado directamente desde la base de datos).
- Modo oscuro con persistencia en `localStorage`.
- Búsqueda y filtros por categoría.
- Carrito con persistencia local y defensivas frente a datos corruptos.
- Constructor PC con validaciones básicas de compatibilidad.
- Panel de administración para CRUD de productos y categorías.

## Arquitectura y tecnologías

- Vite + React 18 + TypeScript
- TailwindCSS (configuración en `tailwind.config.js`) y utilidades en `src/estilos.css`
- Zustand para estado global (`src/stores/tienda*`)
- Supabase (cliente en `src/utils/supabase.ts`) — backend y base de datos
- Stripe Checkout (invocado desde el frontend / Supabase Edge Function según configuración)

## Cómo ejecutar (desarrollo)

1. Instalar dependencias:

```powershell
npm install
```

2. Ejecutar el frontend en modo desarrollo:

```powershell
npm run dev
```

4. Para build de producción:

```powershell
npm run build
```

### Variables de entorno (mínimo)
Crear un archivo `.env.local` o usar `.env.example` con estas variables:

- `VITE_SUPABASE_URL`=
- `VITE_SUPABASE_ANON_KEY`=
- `VITE_STRIPE_PUBLISHABLE_KEY`=

([Ver `.env.example` en el repo](./.env.example))

## Autenticación

La aplicación utiliza Supabase Auth para la gestión de usuarios. La implementación actual integra el proveedor de Google (OAuth) a través del cliente de Supabase centralizado en `src/utils/supabase.ts`.

Detalles de implementación:

- El flujo de login se maneja desde el frontend: se invoca el método de Supabase para redirigir al proveedor (Google) y Supabase devuelve la sesión al completar la autenticación.
- El estado del usuario (email, id y metadata) se mantiene en los stores de la aplicación (Zustand) para su consumo por componentes y por las rutas protegidas del panel de administración.


## Pagos (Stripe)
Para probar el pago se debe usar esta tarjeta, ya que es un entorno de prueba.
- Número: `4000 0003 2000 0021`
- Expiración: `03/33`
- CVC: `333`

La integración con Stripe está basada en Stripe Checkout. La aplicación construye los line_items en dólares estadounidenses y abre una sesión de Checkout para completar el pago.

Detalles de implementación:

- La conversión de precios (ARS → USD) se realiza actualmente en el cliente mediante una llamada a la API pública de tipo de cambio (implementada en `src/stripe-config.ts`). El servicio consulta la cotización oficial y calcula el `unit_amount` en centavos de USD para cada producto seleccionado.
- `src/components/PaymentModal.tsx` utiliza esa utilidad para precalcular el total en USD y mostrarlo en el botón de pago (ej.: "Pagar con Stripe — USD $123.45"). Al confirmar, se construyen los `line_items` en USD cents y se inicia la sesión de Checkout.

## Panel de administración

El panel permite gestionar el catálogo y realizar operaciones CRUD sobre categorías y productos:

- Listar, crear, editar y eliminar productos (nombre, descripción, precio en ARS, categoría, imagen, stock, tags).
- Gestionar categorías (crear/editar/eliminar).
- Verificaciones en UI para evitar datos vacíos o valores inválidos.

Las categorías y productos se consultan y persisten directamente en la base de datos (Supabase). Al guardar desde el admin, se hace la petición a Supabase y los cambios son visibles públicamente.

## Constructor PC

Herramienta para armar una configuración seleccionando componentes (CPU, placa, RAM, GPU, PSU, gabinete, etc.).

Funcionamiento básico:

1. Seleccionás componentes por categoría y los añadís al montaje.
2. El estado del montaje se guarda en el store (componentes seleccionados y total).
3. El UI muestra compatibilidades y advertencias si detecta conflictos (socket, potencia, stock).

Validaciones principales:

- Campos obligatorios: nombre y precio.
- Compatibilidad de socket entre CPU y placa (si hay datos en el catálogo).
- Reglas de cantidad (una placa madre, límite de módulos de RAM, una PSU).
- Estimación de consumo vs PSU y aviso si la PSU puede ser insuficiente.
- Advertencia si el stock es cero o limitado.

## Archivos relevantes

- `src/components/Button.tsx` — botón reutilizable.
- `src/estilos.css` — utilidades y animaciones.
- `src/pages/admin/AdminProductForm.tsx` — manejo de submits largos y reintentos.
- `src/components/PaymentModal.tsx` y `src/stripe-config.ts` — conversión ARS→USD y creación de line_items.
- `src/stores/tiendaCarrito.ts` y `src/pages/Carrito.tsx` — defensivas en persistencia y cálculo de totales.
- `src/utils/supabase.ts` — cliente de Supabase con fallback en desarrollo.

## Pruebas rápidas
**Atención**: De forma local la página no va a funcionar correctamente debido a que no tenés acceso a nuestra base de datos. 

1. Copiá `.env.example` a `.env.local` y completá las claves.
2. `npm install`
3. `npm run dev` y abrí http://localhost:5173
4. Probal el flujo de carrito, admin y pago (usar la tarjeta de prueba indicada).

## Créditos y roles

- **Elías Mateo** — LÍDER DEL PROYECTO & LÍDER TÉCNICO (Frontend, Backend y Base de datos)
  - Responsable general del proyecto y la dirección técnica.
  - Diseñó la arquitectura global (frontend, backend y modelos de datos) y tomó las decisiones técnicas clave.
  - Implementó y lideró el desarrollo del frontend (UI, componentes, integración con stores y ruteo) y del backend.
  - Diseñó y creó la estructura de la base de datos en Supabase, incluidas las tablas, relaciones y los roles/permissions necesarios para la operación segura de la aplicación.
  - Coordinó el equipo, priorizó tareas, revisó código crítico y definió el flujo de pagos y la integración con proveedores.
  - Actuó como nexo entre producto y desarrollo, asegurando que requisitos funcionales y no funcionales se cumplieran.
  - Fue el encargado del despliegue en Vercel y de la configuración de entornos (staging/producción), así como de la monitorización básica post-deploy.

- **Dylan Foster** — TESTING & data entry
  - Responsable de las pruebas (testing), definición y ejecución de casos de prueba.
  - Diseñó planes de prueba (unitarios, de integración y end-to-end) para las rutas críticas de la aplicación.
  - Ingresó datos (Data Entry) y ayudó a poblar la base de datos con contenidos y metadatos de prueba durante el desarrollo.
  - Reportó al equipo sobre fallos/errores y verificó correcciones y apoyó la priorización de bugs.
  - Colaboró activamente en la definición y afinamiento de las validaciones de los componentes, aportando casos de borde y criterios de aceptación.


- **Matías Alvarez** — Segundo programador y mejoras lógicas
  - Actuó como segundo programador, implementando mejoras lógicas, refactorizaciones y correcciones.
  - Implementó validaciones adicionales en el carrito.
  - Mejoró el manejo de errores y los mensajes al usuario, y realizó pequeñas optimizaciones de rendimiento en rutas críticas.
  - Participó en code reviews y pruebas de integración para asegurar estabilidad antes de merges.
## Contribuir

Si querés colaborar, forkeá el repo, hacé cambios en una rama y abrí un pull request describiendo la funcionalidad o corrección.

## Estructura:

```
EDM-Hardware-Group-inc/
├── .vite
│   └── deps
│       ├── _metadata.json
│       └── package.json
├── public
│   └── edm-logo.jpg
├── src
│   ├── components
│   │   ├── AdminDebugPanel.tsx
│   │   ├── AdminLayout.tsx
│   │   ├── AuthModal.tsx
│   │   ├── BarraNavegacion.tsx
│   │   ├── Button.tsx
│   │   ├── DevTelemetryBanner.tsx
│   │   ├── Disposicion.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── NotificationDisplay.tsx
│   │   ├── PaymentModal.tsx
│   │   ├── SupabaseTest.tsx
│   │   └── TarjetaProducto.tsx
│   ├── data
│   │   └── catalogo.ts
│   ├── pages
│   │   ├── admin
│   │   │   ├── AdminActivityLogs.tsx
│   │   │   ├── AdminCategories.tsx
│   │   │   ├── AdminCategoryForm.tsx
│   │   │   ├── AdminProductForm.tsx
│   │   │   ├── AdminProducts.tsx
│   │   │   ├── AdminUserForm.tsx
│   │   │   └── AdminUsers.tsx
│   │   ├── Carrito.tsx
│   │   ├── Categoria.tsx
│   │   ├── ConstructorPC.tsx
│   │   ├── Inicio.tsx
│   │   ├── PaymentFailure.tsx
│   │   ├── PaymentPending.tsx
│   │   └── PaymentSuccess.tsx
│   ├── stores
│   │   ├── tiendaAuth.ts
│   │   ├── tiendaCarrito.ts
│   │   ├── tiendaProductos.ts
│   │   ├── tiendaTema.ts
│   │   └── useNotificationStore.ts
│   ├── utils
│   │   └── supabase.ts
│   ├── Aplicacion.tsx
│   ├── estilos.css
│   ├── main.tsx
│   ├── stripe-config.ts
│   └── vite-env.d.ts
├── supabase
│   ├── functions
│   │   ├── stripe-checkout
│   │   │   ├── deno.d.ts
│   │   │   └── index.ts
│   │   ├── stripe-webhook
│   │   │   ├── deno.d.ts
│   │   │   └── index.ts
│   │   └── deno.json
│   └── migrations
│       ├── 20250910040400_pink_dawn.sql
│       ├── 20250910040430_turquoise_reef.sql
│       ├── 20250928192241_misty_portal.sql
│       └── 20250929013747_wandering_shape.sql
├── utils
│   └── supabase.ts
├── .env
├── .env.example
├── .gitignore
├── edm-logo.jpg
├── eslint.config.js
├── index.html
├── package-lock.json
├── package.json
├── postcss.config.js
├── PrimerEntregableNota.txt
├── README.md
├── tailwind.config.js
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
├── vercel.json
└── vite.config.ts
```


---

Hecho con dedicación por **Elías Mateo**, **Matías Alvarez** y **Dylan Foster**.





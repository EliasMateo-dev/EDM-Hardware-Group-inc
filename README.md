# EDM Hardware

Proyecto web de catálogo interactivo de componentes de hardware. Usa React + TypeScript, Vite y TailwindCSS. Incluye un catálogo consultado desde la base de datos, un carrito, un Constructor PC y un panel de administración.

<!-- TOC -->
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
- [Pruebas rápidas (Try it)](#pruebas-rápidas-try-it)
- [Créditos y roles](#créditos-y-roles)
- [Contribuir](#contribuir)

## Descripción rápida

Proyecto web de catálogo interactivo de componentes de hardware. Diseñado para explorar, filtrar y preparar una PC personalizada con integración de pagos y panel de administración.

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

3. (Opcional) Si tenés el servidor de pagos/local functions:

```powershell
npm run dev:server
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
- `VITE_USD_FALLBACK`=350

([Ver `.env.example` en el repo](./.env.example))

## Autenticación

El proyecto soporta inicio de sesión con Google mediante Supabase Auth. Para que funcione localmente:

1. Habilitá Google en tu proyecto de Supabase (con OAuth) y configurá los redirect URLs.
2. Definí `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` en tu entorno.
3. En la interfaz pública verás un botón de "Iniciar sesión con Google" (header o modal de login según la UI).

Al iniciar sesión se guarda la cuenta de usuario en Supabase (email y metadata). En desarrollo, si faltan las variables de Supabase, el cliente de `src/utils/supabase.ts` usa un fallback que evita errores de importación, pero el login no funcionará.

## Pagos (Stripe)

El checkout usa Stripe Checkout. Para pruebas en modo test usar la tarjeta de ejemplo:

- Número: `4000 0003 2000 0021`
- Expiración: `03/33`
- CVC: `333`

Usá claves de prueba en `VITE_STRIPE_PUBLISHABLE_KEY`. Nota: en producción conviene ejecutar la conversión ARS→USD y la creación de la sesión de Stripe desde el servidor para asegurar montos.

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

## Pruebas rápidas (Try it) --- Atención: De forma local la página no va a funcionar correctamente debido a que no tenés acceso a nuestra base de datos. 

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

---

Hecho con dedicación por **Elías Mateo**, **Matías Alvarez** y **Dylan Foster**.





# Estructura del Proyecto EDM Hardware

Este documento describe la estructura completa del proyecto EDM Hardware Group Inc., una aplicación web de e-commerce para componentes de hardware construida con React, TypeScript, Vite y Supabase.

## 📁 Estructura de Directorios

```
EDM-Hardware-Group-inc/
│
├── public/                          # Archivos estáticos públicos
│   └── edm-logo.jpg                # Logo de la empresa
│
├── src/                            # Código fuente principal
│   │
│   ├── components/                 # Componentes React reutilizables
│   │   ├── AdminDebugPanel.tsx    # Panel de depuración para administradores
│   │   ├── AdminLayout.tsx        # Layout principal del panel de admin
│   │   ├── AuthModal.tsx          # Modal de autenticación (login/registro)
│   │   ├── BarraNavegacion.tsx    # Barra de navegación principal
│   │   ├── Button.tsx             # Componente de botón reutilizable
│   │   ├── DevTelemetryBanner.tsx # Banner de telemetría para desarrollo
│   │   ├── Disposicion.tsx        # Layout general de la aplicación
│   │   ├── ErrorBoundary.tsx      # Manejo de errores React
│   │   ├── NotificationDisplay.tsx # Sistema de notificaciones
│   │   ├── PaymentModal.tsx       # Modal para procesar pagos con Stripe
│   │   ├── SupabaseTest.tsx       # Componente de prueba de Supabase
│   │   └── TarjetaProducto.tsx    # Tarjeta de producto individual
│   │
│   ├── data/                       # Datos y catálogos
│   │   └── catalogo.ts            # Catálogo de productos (fallback)
│   │
│   ├── pages/                      # Páginas principales de la aplicación
│   │   │
│   │   ├── admin/                 # Páginas del panel de administración
│   │   │   ├── AdminActivityLogs.tsx    # Logs de actividad del sistema
│   │   │   ├── AdminCategories.tsx      # Gestión de categorías
│   │   │   ├── AdminCategoryForm.tsx    # Formulario de categorías
│   │   │   ├── AdminProductForm.tsx     # Formulario de productos
│   │   │   ├── AdminProducts.tsx        # Gestión de productos
│   │   │   ├── AdminUserForm.tsx        # Formulario de usuarios
│   │   │   └── AdminUsers.tsx           # Gestión de usuarios
│   │   │
│   │   ├── Carrito.tsx            # Página del carrito de compras
│   │   ├── Categoria.tsx          # Página de visualización por categoría
│   │   ├── ConstructorPC.tsx      # Constructor de PC personalizado
│   │   ├── Inicio.tsx             # Página de inicio
│   │   ├── PaymentFailure.tsx     # Página de pago fallido
│   │   ├── PaymentPending.tsx     # Página de pago pendiente
│   │   └── PaymentSuccess.tsx     # Página de pago exitoso
│   │
│   ├── stores/                     # Estado global (Zustand)
│   │   ├── tiendaAuth.ts          # Store de autenticación
│   │   ├── tiendaCarrito.ts       # Store del carrito de compras
│   │   ├── tiendaProductos.ts     # Store de productos
│   │   ├── tiendaTema.ts          # Store del tema (modo oscuro/claro)
│   │   └── useNotificationStore.ts # Store de notificaciones
│   │
│   ├── utils/                      # Utilidades y helpers
│   │   └── supabase.ts            # Cliente de Supabase configurado
│   │
│   ├── Aplicacion.tsx              # Componente principal de la aplicación
│   ├── estilos.css                # Estilos CSS globales y utilidades
│   ├── main.tsx                   # Punto de entrada de React
│   ├── stripe-config.ts           # Configuración de Stripe y conversión de moneda
│   └── vite-env.d.ts              # Tipos de entorno de Vite
│
├── supabase/                       # Configuración de Supabase
│   │
│   ├── functions/                 # Edge Functions de Supabase
│   │   ├── stripe-checkout/       # Función para crear sesión de checkout
│   │   │   ├── index.ts
│   │   │   └── deno.d.ts
│   │   │
│   │   ├── stripe-webhook/        # Función para manejar webhooks de Stripe
│   │   │   ├── index.ts
│   │   │   └── deno.d.ts
│   │   │
│   │   └── deno.json              # Configuración de Deno
│   │
│   └── migrations/                # Migraciones de base de datos
│       ├── 20250910040400_pink_dawn.sql
│       ├── 20250910040430_turquoise_reef.sql
│       ├── 20250928192241_misty_portal.sql
│       └── 20250929013747_wandering_shape.sql
│
├── utils/                          # Utilidades compartidas (legacy)
│   └── supabase.ts                # Instancia duplicada de cliente Supabase
│
├── .env.example                    # Ejemplo de variables de entorno
├── .gitignore                      # Archivos ignorados por Git
├── edm-logo.jpg                    # Logo adicional
├── eslint.config.js               # Configuración de ESLint
├── index.html                      # HTML principal
├── package.json                    # Dependencias del proyecto
├── package-lock.json              # Lock de dependencias
├── postcss.config.js              # Configuración de PostCSS
├── PrimerEntregableNota.txt       # Notas del primer entregable
├── README.md                       # Documentación principal
├── tailwind.config.js             # Configuración de TailwindCSS
├── tsconfig.json                   # Configuración principal de TypeScript
├── tsconfig.app.json              # Configuración de TypeScript para la app
├── tsconfig.node.json             # Configuración de TypeScript para Node
├── vercel.json                     # Configuración de deployment en Vercel
└── vite.config.ts                 # Configuración de Vite

```

## 🏗️ Arquitectura de la Aplicación

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React)                        │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Pages     │  │  Components  │  │    Stores    │       │
│  │             │  │              │  │   (Zustand)  │       │
│  │ - Inicio    │  │ - Navbar     │  │ - Auth       │       │
│  │ - Carrito   │  │ - Products   │  │ - Carrito    │       │
│  │ - Admin     │  │ - Modals     │  │ - Productos  │       │
│  │ - PC Build  │  │ - Layout     │  │ - Tema       │       │
│  └─────────────┘  └──────────────┘  └──────────────┘       │
│         │                 │                   │              │
│         └─────────────────┴───────────────────┘              │
│                           │                                  │
└───────────────────────────┼──────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Capa de Servicios                          │
│  ┌──────────────────────┐  ┌──────────────────────┐         │
│  │  Supabase Client     │  │  Stripe Integration  │         │
│  │  (Auth + DB)         │  │  (Payments)          │         │
│  └──────────────────────┘  └──────────────────────┘         │
└───────────────────────────┼──────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Backend Services                        │
│  ┌──────────────────────┐  ┌──────────────────────┐         │
│  │  Supabase Backend    │  │  Stripe API          │         │
│  │  - Auth              │  │  - Checkout          │         │
│  │  - Database (PG)     │  │  - Webhooks          │         │
│  │  - Edge Functions    │  │  - Payment Process   │         │
│  └──────────────────────┘  └──────────────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

## 📦 Componentes Principales

### Frontend (React + TypeScript)

#### **Páginas Públicas**
- **Inicio.tsx**: Landing page con productos destacados
- **Categoria.tsx**: Listado de productos por categoría con filtros
- **Carrito.tsx**: Gestión del carrito de compras
- **ConstructorPC.tsx**: Herramienta para armar PC personalizada

#### **Páginas de Admin**
- **AdminProducts.tsx**: CRUD de productos
- **AdminCategories.tsx**: CRUD de categorías
- **AdminUsers.tsx**: Gestión de usuarios
- **AdminActivityLogs.tsx**: Logs de actividad del sistema

#### **Componentes Compartidos**
- **BarraNavegacion.tsx**: Navegación principal con búsqueda y carrito
- **TarjetaProducto.tsx**: Tarjeta de producto reutilizable
- **AuthModal.tsx**: Modal de autenticación con Google OAuth
- **PaymentModal.tsx**: Modal de pago integrado con Stripe

### Backend (Supabase)

#### **Base de Datos (PostgreSQL)**
Tablas principales:
- `productos`: Catálogo de productos
- `categorias`: Categorías de productos
- `usuarios`: Información de usuarios
- `pedidos`: Historial de pedidos
- `activity_logs`: Logs de actividad

#### **Edge Functions (Deno)**
- **stripe-checkout**: Crea sesiones de checkout en Stripe
- **stripe-webhook**: Maneja webhooks de Stripe para actualizar estados de pedidos

### Estado Global (Zustand)

- **tiendaAuth.ts**: Manejo de sesión y usuario autenticado
- **tiendaCarrito.ts**: Estado del carrito con persistencia en localStorage
- **tiendaProductos.ts**: Catálogo de productos y filtros
- **tiendaTema.ts**: Preferencias de tema (modo oscuro/claro)
- **useNotificationStore.ts**: Sistema de notificaciones toast

## 🔄 Flujo de Datos Principal

### Flujo de Compra
```
1. Usuario explora productos (Inicio/Categoria)
   ↓
2. Agrega productos al carrito (TarjetaProducto → tiendaCarrito)
   ↓
3. Revisa carrito (Carrito.tsx)
   ↓
4. Inicia pago (PaymentModal)
   ↓
5. Stripe Checkout (Edge Function stripe-checkout)
   ↓
6. Confirmación de pago (stripe-webhook)
   ↓
7. Redirección a página de éxito/fallo
```

### Flujo de Autenticación
```
1. Usuario hace clic en "Iniciar Sesión"
   ↓
2. AuthModal se abre
   ↓
3. Google OAuth (Supabase Auth)
   ↓
4. Sesión guardada (tiendaAuth)
   ↓
5. Acceso a funcionalidades protegidas
```

### Flujo de Administración
```
1. Admin inicia sesión
   ↓
2. Accede al panel de admin (AdminLayout)
   ↓
3. Gestiona productos/categorías/usuarios
   ↓
4. Cambios se sincronizan con Supabase
   ↓
5. Cambios visibles en el catálogo público
```

## 🛠️ Tecnologías y Herramientas

### Frontend
- **React 18**: Framework UI
- **TypeScript**: Tipado estático
- **Vite**: Build tool y dev server
- **TailwindCSS**: Framework CSS utility-first
- **React Router**: Navegación SPA
- **Zustand**: State management ligero
- **Lucide React**: Iconos

### Backend y Servicios
- **Supabase**: BaaS (Backend as a Service)
  - PostgreSQL Database
  - Authentication (Google OAuth)
  - Edge Functions (Deno)
- **Stripe**: Procesamiento de pagos
- **Vercel**: Hosting y deployment

### Desarrollo
- **ESLint**: Linting de código
- **PostCSS**: Procesamiento de CSS
- **Autoprefixer**: Prefijos CSS automáticos

## 📝 Archivos de Configuración

| Archivo | Propósito |
|---------|-----------|
| `vite.config.ts` | Configuración de Vite (build, dev server, plugins) |
| `tailwind.config.js` | Configuración de TailwindCSS (colores, temas) |
| `tsconfig.json` | Configuración principal de TypeScript |
| `tsconfig.app.json` | Configuración de TypeScript para la aplicación |
| `tsconfig.node.json` | Configuración de TypeScript para scripts de Node |
| `eslint.config.js` | Reglas de linting |
| `postcss.config.js` | Plugins de PostCSS |
| `vercel.json` | Configuración de deployment en Vercel |
| `.env.example` | Template de variables de entorno |

## 🔐 Variables de Entorno

El proyecto requiere las siguientes variables de entorno (ver `.env.example`):

```
VITE_SUPABASE_URL=          # URL del proyecto Supabase
VITE_SUPABASE_ANON_KEY=     # Clave anónima de Supabase
VITE_STRIPE_PUBLISHABLE_KEY= # Clave pública de Stripe
```

## 🚀 Scripts Disponibles

```bash
npm run dev      # Inicia el servidor de desarrollo
npm run build    # Construye la aplicación para producción
npm run lint     # Ejecuta el linter
npm run preview  # Previsualiza el build de producción
```

## 📚 Documentación Adicional

Para más información sobre el proyecto, consulta:
- [README.md](./README.md) - Documentación principal del proyecto
- [.env.example](./.env.example) - Variables de entorno requeridas
- Código fuente comentado en `src/`

---

**Última actualización**: 2025-10-21
**Mantenido por**: Elías Mateo, Matías Alvarez, Dylan Foster

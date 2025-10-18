# EDM Hardware
**ACLARACIÓN**: El usuario "**CRUFTYY**" es también **Elías Mateo** 😁

Proyecto web de catálogo interactivo de componentes de hardware creado por Elías Mateo, Dylan Foster y Matías Alvarez. Usa React + TypeScript, Vite y TailwindCSS. Incluye un catálogo con filtros, un carrito local, un constructor de PC y un panel de administración. Muchas partes están orientadas a servir como demo y base para expandir funcionalidades.

## Qué se implementó (resumen de cambios recientes)
- Componentes visuales y utilidades de animación:
  - Se añadió un componente reutilizable `Button` y utilidades de animación en `src/estilos.css` (fade-in, slide-up, card-lift, etc.).
  - Se aplicaron estilos y animaciones a varias páginas del panel de administración y formularios para mejorar la experiencia.
- Mejoras de robustez (bugs y estabilidad):
  - Correcciones defensivas en el carrito para evitar bloqueos por datos corruptos en `localStorage` (`src/pages/Carrito.tsx`, `src/stores/tiendaCarrito.ts`).
  - Refactor del formulario de productos del admin para evitar que la UI quede "Guardando..." indefinidamente y añadir una opción de reintento en peticiones lentas (`src/pages/admin/AdminProductForm.tsx`).
  - `src/utils/supabase.ts` ahora exporta un cliente seguro/fallback cuando faltan variables de entorno en desarrollo local, evitando errores de importación.
- Pago (Stripe) y conversión de moneda:
  - Se añadió conversión ARS → USD en cliente usando la cotización del Dólar Oficial (API: https://dolarapi.com/v1/dolares/oficial) y se construyen los `line_items` en centavos USD para enviar a Stripe desde el frontend (`src/stripe-config.ts`, `src/components/PaymentModal.tsx`).
  - Nota importante: para producción es recomendable mover la conversión y la creación de la sesión de pago al servidor para evitar manipulación de montos en el cliente.

## Características principales
- Catálogo de componentes (consultado directamente desde la base de datos).
- Modo oscuro con persistencia en `localStorage`.
- Buscador y filtros por categoría.
- Carrito con persistencia local (mejoras recientes de robustez).
- Panel de administración (estilos y UX mejorados recientemente).

## Arquitectura y tecnologías
- Vite + React 18 + TypeScript
- TailwindCSS (configuración en `tailwind.config.js`) y utilidades en `src/estilos.css`
- Zustand para estado global (`src/stores/tienda*`)
- Supabase (cliente en `src/utils/supabase.ts`) — integración en curso
- Stripe Checkout (invocado desde el frontend / Supabase Edge Function según configuración de deploy)

## Ejecutar el proyecto (desarrollo)
Instala dependencias y lanza el servidor de desarrollo:

```powershell
npm install # instala las dependencias 
npm run dev # corre el proyecto        
```

Para construir la versión de producción:

```powershell
npm run build
```


## Archivos relevantes (dónde mirar para los cambios recientes)
- `src/components/Button.tsx` — botón reutilizable con variantes.
- `src/estilos.css` — utilidades y clases de animación.
- `src/pages/admin/AdminProductForm.tsx` — manejo mejorado de submits largos y reintentos.
- `src/components/PaymentModal.tsx` y `src/stripe-config.ts` — conversión ARS→USD y preparación de `line_items` para Stripe.
- `src/stores/tiendaCarrito.ts` y `src/pages/Carrito.tsx` — defensivas en persistencia y cálculo de totales.
- `src/utils/supabase.ts` — cliente seguro/fallback para desarrollo.


## Autenticación
Este proyecto soporta inicio de sesión con Google a través de Supabase Auth:

Desde la interfaz pública podés iniciar sesión con google donde se guarda tu gmail y .


## **Probar pagos con Stripe** (tarjeta de prueba)
Para probar el flujo de pago con Stripe en modo test utiliza la tarjeta de prueba siguiente en el formulario de checkout:

- Número: **`4000 0003 2000 0021`**
- Fecha de expiración: **`03/33`**
- CVC: **`333`**

Con estas credenciales el flujo de Stripe simula un pago exitoso en modo test. Asegurate de usar las claves de Stripe de prueba en `VITE_STRIPE_PUBLISHABLE_KEY` y en el servidor (si aplica).


## Panel de administración — qué se puede hacer
El panel de administración permite gestionar el catálogo y realizar operaciones CRUD sobre categorías y productos. Funcionalidades típicas disponibles desde el panel admin:

- Listar productos y categorías.
- Crear nuevos productos (nombre, descripción, precio en ARS, categoría, imagen/thumbnail, stock, tags).
- Editar productos existentes y actualizar sus atributos.
- Eliminar productos o marcarlos como no disponibles.
- Crear, editar y eliminar categorías.
- Verificaciones básicas en el UI para evitar datos vacíos o precios inválidos.

Importante: en la implementación actual las categorías y productos se consultan y se guardan directamente en la base de datos (Supabase). Esto significa que:

- Al crear o editar un producto desde el admin, se envía la petición a la API/Supabase y los cambios persisten en la base de datos.
- La lista pública del catálogo lee directamente las tablas para mostrar los productos y categorías actualizados.


## Constructor PC — cómo funciona y validaciones
El Constructor PC es una herramienta para armar una configuración seleccionando componentes (CPU, Motherboard, RAM, GPU, PSU, Gabinete, etc.).

Funcionamiento básico:

1. El usuario selecciona una categoría de componente y añade uno o varios ítems al montaje.
2. El sistema mantiene un estado del montaje (componentes seleccionados y el total) en el store (`useTiendaProductos` / `useTiendaCarrito` según implementación).
3. El UI muestra compatibilidades sugeridas y alertas cuando hay conflictos básicos (por ejemplo: socket de CPU incompatible con la placa madre, potencia insuficiente según la PSU seleccionada).

Validaciones implementadas :

- Campos obligatorios: los componentes agregados deben tener nombre y precio válidos.
- Compatibilidad de socket: cuando se selecciona una CPU se verifica el socket y se sugiere únicamente placas base compatibles (si la información está presente en el catálogo).
- Reglas de cantidad: por ejemplo sólo una placa madre por montaje, máximo 4 módulos de RAM (según el drive info), una PSU por montaje.
- Potencia estimada vs PSU: se muestra una estimación de consumo y una advertencia si la PSU seleccionada puede ser insuficiente.
- Stock mínimo: se advierte si el producto seleccionado tiene stock cero o limitado.

Nota: el Constructor se apoya en los metadatos del catálogo (campos extendidos) para calcular compatibilidades. Si el catálogo no tiene la información completa, las validaciones son conservadoras (muestran advertencias en lugar de bloquear completamente la acción).


## Contribuir
Si querés colaborar, forkeá el repo, hacé cambios en una rama y abrí un pull request describiendo la funcionalidad o corrección. 😁

---

Hecho con dedicación por **Elías Mateo**, **Matías Alvarez** y **Dylan Foster**.


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

---

Hecho con dedicación por **Elías Mateo**, **Matías Alvarez** y **Dylan Foster**.




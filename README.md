# EDM Hardware  

**ACLARACIÓN**: El usuario "**CRUFTYY**" es **Elías Mateo** 😁

Proyecto web creado por **Elías Mateo**, **Dylan Foster** y **Matías Alvarez** para presentar un catálogo interactivo de componentes de hardware con un modo oscuro, integración con Supabase (en proceso!) y estado global mediante Zustand. El objetivo es ofrecer una experiencia moderna para explorar, filtrar y preparar una PC personalizada.

## Características principales
- **Catálogo completo** de CPU, GPU, memorias, gabinetes y más.
- **Modo oscuro por defecto** con interruptor persistente (almacenado en `localStorage`).
- **Búsqueda y filtros en tiempo real** por categoría y término.
- **Carrito** guarda la selección del usuario en el navegador.
- **Constructor PC** con roadmap de funcionalidades planeadas, todavía no terminado.
- **UI responsive** con TailwindCSS y componentes propios.

## Arquitectura
- **Framework:** Vite + React 18 con TypeScript.
- **Estado global:** Zustand (`src/stores/tienda*`).
- **Estilos:** TailwindCSS con soporte `darkMode: 'class'` y utilidades personalizadas en `src/estilos.css`.
- **Ruteo:** React Router 7 (`src/Aplicacion.tsx`).
- **Datos mockeados:** `src/data/catalogo.ts` para categorías y productos.   
- **Migraciones:** carpeta `supabase/migrations` con esquema inicial y seed.

```
```

## Comandos
```bash

npm install 

npm run dev              # Solo frontend
npm run dev:server       # Solo servidor de pagos  
npm run dev:full         # Frontend + servidor de pagos

npm run build

```


## Roadmap
- [x] Integrar Mercado Pago con Vexor para pagos.
- [ ] Completar integración con Supabase.
- [ ] Añadir autenticación básica y favoritos.
- [ ] Completar el flujo del Constructor PC (compatibilidades) etc.
- [ ] Añadir tests.
- [ ] Guardado de datos mediante la nube (guardado en la cuenta del usuario)
- [ ] Sistema de órdenes y seguimiento de pedidos.
- [ ] Panel de administración para gestión de productos.

## Autor
Hecho con dedicación por **Elías Mateo**, **Matías Alvarez** y **Dylan Foster**, gracias por leer.

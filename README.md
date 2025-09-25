# EDM Hardware 

**ACLARACIÓN**: El usuario "**CRUFTYY**" es **Elías Mateo** 😁

Proyecto web creado por **Elías Mateo**, **Matías Alvarez** y **Dylan Foster** para presentar un catálogo interactivo de componentes de hardware con un modo oscuro, integración con Supabase (en proceso!) y estado global mediante Zustand. El objetivo es ofrecer una experiencia moderna para explorar, filtrar y preparar una PC personalizada.

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
src/
├─ Aplicacion.tsx          # Entrada principal de rutas y tiendas
├─ components/
│  ├─ BarraNavegacion.tsx  # Navbar con búsqueda, carrito y modo oscuro
│  ├─ Disposicion.tsx      # Layout general con Outlet
│  └─ TarjetaProducto.tsx  # Card reutilizable de producto
├─ data/catalogo.ts        # Tipos y datos estáticos en español
├─ pages/
│  ├─ Inicio.tsx           # Hero, categorías y destacados
│  ├─ Categoria.tsx        # Listado filtrado por alias
│  ├─ Carrito.tsx          # Gestión completa del carrito
│  └─ ConstructorPC.tsx    # Roadmap de funcionalidades futuras
└─ stores/
   ├─ tiendaProductos.ts   # Búsqueda, filtros y categorías
   ├─ tiendaCarrito.ts     # Persistencia del carrito en localStorage
   └─ tiendaTema.ts        # Modo oscuro/claro persistente
```

## Comandos
```bash

npm install 

npm run dev    

npm run build

```


## Roadmap
- [ ] Integrar Supabase.
- [ ] Añadir autenticación básica y favoritos.
- [ ] Completar el flujo del Constructor PC (compatibilidades) etc.
- [ ] Añadir tests.
- [ ] Guardado de datos mediante la nube (guardado en la cuenta del usuario)
- [ ] 

## Autor
Hecho con dedicación por **Elías Mateo**, **Matías Alvarez** y **Dylan Foster**, gracias por leer.

export interface Categoria {
  id: string;
  nombre: string;
  alias: string;
  descripcion?: string;
  icono?: string;
}

export interface Producto {
  id: string;
  nombre: string;
  alias: string;
  categoriaId: string;
  marca: string;
  modelo: string;
  descripcion: string;
  precio: number;
  existencias: number;
  imagen: string;
  especificaciones: Record<string, string>;
}

export const categorias: Categoria[] = [
  {
    id: 'cat-cpu',
    nombre: 'CPU',
    alias: 'cpu',
    descripcion: 'Procesadores modernos para gaming y creacion de contenido.'
  },
  {
    id: 'cat-motherboard',
    nombre: 'Motherboard',
    alias: 'motherboard',
    descripcion: 'Motherboards'
  },
  {
    id: 'cat-ram',
    nombre: 'RAM',
    alias: 'ram',
    descripcion: 'Memoria rapida para multitarea fluida.'
  },
  {
    id: 'cat-gpu',
    nombre: 'GPU',
    alias: 'gpu',
    descripcion: 'Tarjetas graficas para jugar AAA y renderizar sin limites.'
  },
  {
    id: 'cat-psu',
    nombre: 'PSU',
    alias: 'psu',
    descripcion: 'Fuentes eficientes y silenciosas.'
  },
  {
    id: 'cat-case',
    nombre: 'Gabinete',
    alias: 'case',
    descripcion: 'Gabinetes espaciosos con flujo de aire optimizado.'
  },
  {
    id: 'cat-ssd',
    nombre: 'SSD',
    alias: 'ssd',
    descripcion: 'Almacenamiento NVMe y SATA para cargas rapidas.'
  }
];

export const productos: Producto[] = [
  {
    id: 'prod-ryzen5-7600',
    nombre: 'AMD Ryzen 5 7600',
    alias: 'amd-ryzen-5-7600',
    categoriaId: 'cat-cpu',
    marca: 'AMD',
    modelo: 'Ryzen 5 7600',
    descripcion: '6 nucleos y 12 hilos con boost hasta 5.1 GHz. Ideal para gaming equilibrado.',
    precio: 289999,
    existencias: 12,
    imagen: '',
    especificaciones: {
      socket: 'AM5',
      cores: '6',
      threads: '12',
      tdp: '65 W'
    }
  },
  {
    id: 'prod-intel-i5-13600k',
    nombre: 'Intel Core i5 13600K',
    alias: 'intel-core-i5-13600k',
    categoriaId: 'cat-cpu',
    marca: 'Intel',
    modelo: 'Core i5 13600K',
    descripcion: 'Arquitectura hibrida con 14 nucleos totales para tareas exigentes.',
    precio: 354999,
    existencias: 8,
    imagen: '',
    especificaciones: {
      socket: 'LGA1700',
      cores: '14 (6P + 8E)',
      threads: '20',
      tdp: '125 W'
    }
  },
  {
    id: 'prod-asus-b650m',
    nombre: 'ASUS TUF Gaming B650M-PLUS WIFI',
    alias: 'asus-tuf-b650m-plus',
    categoriaId: 'cat-motherboard',
    marca: 'ASUS',
    modelo: 'TUF Gaming B650M-PLUS WIFI',
    descripcion: 'Motherboard micro ATX con VRM robusto y conectividad WiFi 6.',
    precio: 269999,
    existencias: 6,
    imagen: '',
    especificaciones: {
      socket: 'AM5',
      factor: 'Micro ATX',
      memory: 'DDR5 6400+',
      connectivity: 'WiFi 6, 2.5G LAN'
    }
  },
  {
    id: 'prod-msi-z790',
    nombre: 'MSI MPG Z790 EDGE WIFI',
    alias: 'msi-mpg-z790-edge',
    categoriaId: 'cat-motherboard',
    marca: 'MSI',
    modelo: 'MPG Z790 EDGE WIFI',
    descripcion: 'Placa para Intel 13va generacion con PCIe 5.0 y disipadores premium.',
    precio: 399999,
    existencias: 4,
    imagen: '',
    especificaciones: {
      socket: 'LGA1700',
      factor: 'ATX',
      memory: 'DDR5 7200+',
      connectivity: 'WiFi 6E, 2.5G LAN'
    }
  },
  {
    id: 'prod-corsair-32gb',
    nombre: 'Corsair Vengeance RGB 32GB (2x16) DDR5 6000',
    alias: 'corsair-vengeance-32gb-ddr5-6000',
    categoriaId: 'cat-ram',
    marca: 'Corsair',
    modelo: 'Vengeance RGB DDR5',
    descripcion: 'Kit dual channel con latencias CL36 y disipadores de aluminio.',
    precio: 159999,
    existencias: 15,
    imagen: '',
    especificaciones: {
      capacity: '32 GB',
      speed: '6000 MHz',
      type: 'DDR5',
      profile: 'XMP 3.0'
    }
  },
  {
    id: 'prod-hyperx-16gb',
    nombre: 'HyperX Fury 16GB (2x8) DDR4 3600',
    alias: 'hyperx-fury-16gb-ddr4-3600',
    categoriaId: 'cat-ram',
    marca: 'HyperX',
    modelo: 'Fury DDR4',
    descripcion: 'Memoria DDR4 confiable para builds mainstream.',
    precio: 89999,
    existencias: 18,
    imagen: '',
    especificaciones: {
      capacity: '16 GB',
      speed: '3600 MHz',
      type: 'DDR4',
      profile: 'XMP 2.0'
    }
  },
  {
    id: 'prod-rtx-4070',
    nombre: 'NVIDIA GeForce RTX 4070 Founders Edition',
    alias: 'nvidia-rtx-4070',
    categoriaId: 'cat-gpu',
    marca: 'NVIDIA',
    modelo: 'RTX 4070',
    descripcion: 'Rendimiento 1440p ultra con DLSS 3 y trazado de rayos.',
    precio: 769999,
    existencias: 5,
    imagen: '',
    especificaciones: {
      memory: '12 GB GDDR6X',
      boostClock: '2.48 GHz',
      tdp: '200 W',
      outputs: '3x DP 1.4a, 1x HDMI 2.1'
    }
  },
  {
    id: 'prod-rx-7800xt',
    nombre: 'AMD Radeon RX 7800 XT',
    alias: 'amd-radeon-rx-7800-xt',
    categoriaId: 'cat-gpu',
    marca: 'AMD',
    modelo: 'Radeon RX 7800 XT',
    descripcion: 'Perfecta para 1440p competitivo con FSR 3 y memoria abundante.',
    precio: 689999,
    existencias: 7,
    imagen: '',
    especificaciones: {
      memory: '16 GB GDDR6',
      boostClock: '2.4 GHz',
      tdp: '263 W',
      outputs: '3x DP 2.1, 1x HDMI 2.1'
    }
  },
  {
    id: 'prod-corsair-rm750e',
    nombre: 'Corsair RM750e 80 Plus Gold',
    alias: 'corsair-rm750e',
    categoriaId: 'cat-psu',
    marca: 'Corsair',
    modelo: 'RM750e',
    descripcion: 'Fuente modular silenciosa con certificacion Gold.',
    precio: 134999,
    existencias: 10,
    imagen: '',
    especificaciones: {
      wattage: '750 W',
      efficiency: '80 Plus Gold',
      modular: 'Total',
      warranty: '5 anos'
    }
  },
  {
    id: 'prod-thermaltake-gf1',
    nombre: 'Thermaltake Toughpower GF1 650W',
    alias: 'thermaltake-toughpower-gf1-650',
    categoriaId: 'cat-psu',
    marca: 'Thermaltake',
    modelo: 'Toughpower GF1',
    descripcion: 'Fuente compacta ideal para builds de gama media.',
    precio: 109999,
    existencias: 9,
    imagen: '',
    especificaciones: {
      wattage: '650 W',
      efficiency: '80 Plus Gold',
      modular: 'Total',
      warranty: '10 anos'
    }
  },
  {
    id: 'prod-nzxt-h5-flow',
    nombre: 'NZXT H5 Flow',
    alias: 'nzxt-h5-flow',
    categoriaId: 'cat-case',
    marca: 'NZXT',
    modelo: 'H5 Flow',
    descripcion: 'Gabinete ATX con panel perforado y gestion de cables sencilla.',
    precio: 149999,
    existencias: 11,
    imagen: '',
    especificaciones: {
      factor: 'ATX Mid Tower',
      airflow: 'Frente perforado',
      fans: '2 incluidos',
      clearance: 'GPU hasta 365 mm'
    }
  },
  {
    id: 'prod-lianli-lancool216',
    nombre: 'Lian Li Lancool 216',
    alias: 'lian-li-lancool-216',
    categoriaId: 'cat-case',
    marca: 'Lian Li',
    modelo: 'Lancool 216',
    descripcion: 'Flujo de aire excelente con ventiladores ARGB de 160 mm.',
    precio: 184999,
    existencias: 6,
    imagen: '',
    especificaciones: {
      factor: 'ATX Mid Tower',
      airflow: 'Ventiladores 2x160 mm',
      fans: '3 incluidos',
      clearance: 'GPU hasta 392 mm'
    }
  },
  {
    id: 'prod-samsung-990pro',
    nombre: 'Samsung 990 PRO 1TB NVMe',
    alias: 'samsung-990-pro-1tb',
    categoriaId: 'cat-ssd',
    marca: 'Samsung',
    modelo: '990 PRO',
    descripcion: 'NVMe PCIe 4.0 ultra rapido con velocidades de 7450 MB/s.',
    precio: 219999,
    existencias: 14,
    imagen: '',
    especificaciones: {
      capacity: '1 TB',
      interface: 'PCIe 4.0 x4',
      speed: '7450 MB/s lectura',
      endurance: '600 TBW'
    }
  },
  {
    id: 'prod-crucial-mx500',
    nombre: 'Crucial MX500 1TB SATA',
    alias: 'crucial-mx500-1tb',
    categoriaId: 'cat-ssd',
    marca: 'Crucial',
    modelo: 'MX500',
    descripcion: 'SSD SATA solido con memoria TLC y DRAM dedicada.',
    precio: 109999,
    existencias: 20,
    imagen: '',
    especificaciones: {
      capacity: '1 TB',
      interface: 'SATA III',
      speed: '560 MB/s lectura',
      endurance: '360 TBW'
    }
  }
];

export const obtenerProductoPorId = (id: string) => productos.find(producto => producto.id === id);

export const obtenerProductosPorCategoria = (categoriaId: string) =>
  productos.filter(producto => producto.categoriaId === categoriaId);





export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  brand: string;
  model: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  specs: Record<string, string>;
}

export const categories: Category[] = [
  {
    id: 'cat-cpu',
    name: 'CPU',
    slug: 'cpu',
    description: 'Procesadores modernos para gaming y creacion de contenido.'
  },
  {
    id: 'cat-motherboard',
    name: 'Motherboard',
    slug: 'motherboard',
    description: 'Placas base confiables con soporte para las ultimas generaciones.'
  },
  {
    id: 'cat-ram',
    name: 'RAM',
    slug: 'ram',
    description: 'Memoria rapida para multitarea fluida.'
  },
  {
    id: 'cat-gpu',
    name: 'GPU',
    slug: 'gpu',
    description: 'Tarjetas graficas para jugar AAA y renderizar sin limites.'
  },
  {
    id: 'cat-psu',
    name: 'PSU',
    slug: 'psu',
    description: 'Fuentes eficientes y silenciosas.'
  },
  {
    id: 'cat-case',
    name: 'Gabinete',
    slug: 'case',
    description: 'Gabinetes espaciosos con flujo de aire optimizado.'
  },
  {
    id: 'cat-ssd',
    name: 'SSD',
    slug: 'ssd',
    description: 'Almacenamiento NVMe y SATA para cargas rapidas.'
  }
];

export const products: Product[] = [
  {
    id: 'prod-ryzen5-7600',
    name: 'AMD Ryzen 5 7600',
    slug: 'amd-ryzen-5-7600',
    categoryId: 'cat-cpu',
    brand: 'AMD',
    model: 'Ryzen 5 7600',
    description: '6 nucleos y 12 hilos con boost hasta 5.1 GHz. Ideal para gaming equilibrado.',
    price: 289999,
    stock: 12,
    image: '',
    specs: {
      socket: 'AM5',
      cores: '6',
      threads: '12',
      tdp: '65 W'
    }
  },
  {
    id: 'prod-intel-i5-13600k',
    name: 'Intel Core i5 13600K',
    slug: 'intel-core-i5-13600k',
    categoryId: 'cat-cpu',
    brand: 'Intel',
    model: 'Core i5 13600K',
    description: 'Arquitectura hibrida con 14 nucleos totales para tareas exigentes.',
    price: 354999,
    stock: 8,
    image: '',
    specs: {
      socket: 'LGA1700',
      cores: '14 (6P + 8E)',
      threads: '20',
      tdp: '125 W'
    }
  },
  {
    id: 'prod-asus-b650m',
    name: 'ASUS TUF Gaming B650M-PLUS WIFI',
    slug: 'asus-tuf-b650m-plus',
    categoryId: 'cat-motherboard',
    brand: 'ASUS',
    model: 'TUF Gaming B650M-PLUS WIFI',
    description: 'Motherboard micro ATX con VRM robusto y conectividad WiFi 6.',
    price: 269999,
    stock: 6,
    image: '',
    specs: {
      socket: 'AM5',
      factor: 'Micro ATX',
      memory: 'DDR5 6400+',
      connectivity: 'WiFi 6, 2.5G LAN'
    }
  },
  {
    id: 'prod-msi-z790',
    name: 'MSI MPG Z790 EDGE WIFI',
    slug: 'msi-mpg-z790-edge',
    categoryId: 'cat-motherboard',
    brand: 'MSI',
    model: 'MPG Z790 EDGE WIFI',
    description: 'Placa para Intel 13va generacion con PCIe 5.0 y disipadores premium.',
    price: 399999,
    stock: 4,
    image: '',
    specs: {
      socket: 'LGA1700',
      factor: 'ATX',
      memory: 'DDR5 7200+',
      connectivity: 'WiFi 6E, 2.5G LAN'
    }
  },
  {
    id: 'prod-corsair-32gb',
    name: 'Corsair Vengeance RGB 32GB (2x16) DDR5 6000',
    slug: 'corsair-vengeance-32gb-ddr5-6000',
    categoryId: 'cat-ram',
    brand: 'Corsair',
    model: 'Vengeance RGB DDR5',
    description: 'Kit dual channel con latencias CL36 y disipadores de aluminio.',
    price: 159999,
    stock: 15,
    image: '',
    specs: {
      capacity: '32 GB',
      speed: '6000 MHz',
      type: 'DDR5',
      profile: 'XMP 3.0'
    }
  },
  {
    id: 'prod-hyperx-16gb',
    name: 'HyperX Fury 16GB (2x8) DDR4 3600',
    slug: 'hyperx-fury-16gb-ddr4-3600',
    categoryId: 'cat-ram',
    brand: 'HyperX',
    model: 'Fury DDR4',
    description: 'Memoria DDR4 confiable para builds mainstream.',
    price: 89999,
    stock: 18,
    image: '',
    specs: {
      capacity: '16 GB',
      speed: '3600 MHz',
      type: 'DDR4',
      profile: 'XMP 2.0'
    }
  },
  {
    id: 'prod-rtx-4070',
    name: 'NVIDIA GeForce RTX 4070 Founders Edition',
    slug: 'nvidia-rtx-4070',
    categoryId: 'cat-gpu',
    brand: 'NVIDIA',
    model: 'RTX 4070',
    description: 'Rendimiento 1440p ultra con DLSS 3 y trazado de rayos.',
    price: 769999,
    stock: 5,
    image: '',
    specs: {
      memory: '12 GB GDDR6X',
      boostClock: '2.48 GHz',
      tdp: '200 W',
      outputs: '3x DP 1.4a, 1x HDMI 2.1'
    }
  },
  {
    id: 'prod-rx-7800xt',
    name: 'AMD Radeon RX 7800 XT',
    slug: 'amd-radeon-rx-7800-xt',
    categoryId: 'cat-gpu',
    brand: 'AMD',
    model: 'Radeon RX 7800 XT',
    description: 'Perfecta para 1440p competitivo con FSR 3 y memoria abundante.',
    price: 689999,
    stock: 7,
    image: '',
    specs: {
      memory: '16 GB GDDR6',
      boostClock: '2.4 GHz',
      tdp: '263 W',
      outputs: '3x DP 2.1, 1x HDMI 2.1'
    }
  },
  {
    id: 'prod-corsair-rm750e',
    name: 'Corsair RM750e 80 Plus Gold',
    slug: 'corsair-rm750e',
    categoryId: 'cat-psu',
    brand: 'Corsair',
    model: 'RM750e',
    description: 'Fuente modular silenciosa con certificacion Gold.',
    price: 134999,
    stock: 10,
    image: '',
    specs: {
      wattage: '750 W',
      efficiency: '80 Plus Gold',
      modular: 'Total',
      warranty: '5 anos'
    }
  },
  {
    id: 'prod-thermaltake-gf1',
    name: 'Thermaltake Toughpower GF1 650W',
    slug: 'thermaltake-toughpower-gf1-650',
    categoryId: 'cat-psu',
    brand: 'Thermaltake',
    model: 'Toughpower GF1',
    description: 'Fuente compacta ideal para builds de gama media.',
    price: 109999,
    stock: 9,
    image: '',
    specs: {
      wattage: '650 W',
      efficiency: '80 Plus Gold',
      modular: 'Total',
      warranty: '10 anos'
    }
  },
  {
    id: 'prod-nzxt-h5-flow',
    name: 'NZXT H5 Flow',
    slug: 'nzxt-h5-flow',
    categoryId: 'cat-case',
    brand: 'NZXT',
    model: 'H5 Flow',
    description: 'Gabinete ATX con panel perforado y gestion de cables sencilla.',
    price: 149999,
    stock: 11,
    image: '',
    specs: {
      factor: 'ATX Mid Tower',
      airflow: 'Frente perforado',
      fans: '2 incluidos',
      clearance: 'GPU hasta 365 mm'
    }
  },
  {
    id: 'prod-lianli-lancool216',
    name: 'Lian Li Lancool 216',
    slug: 'lian-li-lancool-216',
    categoryId: 'cat-case',
    brand: 'Lian Li',
    model: 'Lancool 216',
    description: 'Flujo de aire excelente con ventiladores ARGB de 160 mm.',
    price: 184999,
    stock: 6,
    image: '',
    specs: {
      factor: 'ATX Mid Tower',
      airflow: 'Ventiladores 2x160 mm',
      fans: '3 incluidos',
      clearance: 'GPU hasta 392 mm'
    }
  },
  {
    id: 'prod-samsung-990pro',
    name: 'Samsung 990 PRO 1TB NVMe',
    slug: 'samsung-990-pro-1tb',
    categoryId: 'cat-ssd',
    brand: 'Samsung',
    model: '990 PRO',
    description: 'NVMe PCIe 4.0 ultra rapido con velocidades de 7450 MB/s.',
    price: 219999,
    stock: 14,
    image: '',
    specs: {
      capacity: '1 TB',
      interface: 'PCIe 4.0 x4',
      speed: '7450 MB/s lectura',
      endurance: '600 TBW'
    }
  },
  {
    id: 'prod-crucial-mx500',
    name: 'Crucial MX500 1TB SATA',
    slug: 'crucial-mx500-1tb',
    categoryId: 'cat-ssd',
    brand: 'Crucial',
    model: 'MX500',
    description: 'SSD SATA solido con memoria TLC y DRAM dedicada.',
    price: 109999,
    stock: 20,
    image: '',
    specs: {
      capacity: '1 TB',
      interface: 'SATA III',
      speed: '560 MB/s lectura',
      endurance: '360 TBW'
    }
  }
];

export const getProductById = (id: string) => products.find(product => product.id === id);

export const getProductsByCategory = (categoryId: string) =>
  products.filter(product => product.categoryId === categoryId);
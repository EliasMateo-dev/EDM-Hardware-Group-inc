/*
  # Productos de muestra para el catálogo inicial

  1. Productos por categoría
    - CPUs: AMD e Intel con especificaciones reales
    - Motherboards: Compatible con los CPUs
    - RAM: DDR4 y DDR5
    - GPUs: NVIDIA y AMD
    - PSUs: Diferentes potencias
    - Gabinetes: Varios tamaños
    - SSDs: NVMe y SATA
*/

-- CPUs
INSERT INTO products (category_id, name, brand, model, description, price, stock, image_url, specifications) 
SELECT 
  c.id,
  'AMD Ryzen 5 5600X',
  'AMD',
  '5600X',
  'Procesador de 6 núcleos y 12 hilos, ideal para gaming y productividad',
  45999.00,
  25,
  'https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg',
  '{"socket": "AM4", "cores": 6, "threads": 12, "base_clock": "3.7 GHz", "boost_clock": "4.6 GHz", "tdp": "65W", "architecture": "Zen 3"}'
FROM categories c WHERE c.slug = 'cpu';

INSERT INTO products (category_id, name, brand, model, description, price, stock, image_url, specifications) 
SELECT 
  c.id,
  'Intel Core i5-12400F',
  'Intel',
  'i5-12400F',
  'Procesador de 6 núcleos (6P+0E), excelente relación precio/rendimiento',
  42999.00,
  20,
  'https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg',
  '{"socket": "LGA1700", "cores": 6, "threads": 12, "base_clock": "2.5 GHz", "boost_clock": "4.4 GHz", "tdp": "65W", "architecture": "Alder Lake"}'
FROM categories c WHERE c.slug = 'cpu';

-- Motherboards
INSERT INTO products (category_id, name, brand, model, description, price, stock, image_url, specifications) 
SELECT 
  c.id,
  'MSI B450 TOMAHAWK MAX',
  'MSI',
  'B450 TOMAHAWK MAX',
  'Motherboard AM4 con soporte para Ryzen serie 3000 ready',
  18999.00,
  15,
  'https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg',
  '{"socket": "AM4", "chipset": "B450", "memory_type": "DDR4", "max_memory": "128GB", "memory_slots": 4, "form_factor": "ATX"}'
FROM categories c WHERE c.slug = 'motherboard';

INSERT INTO products (category_id, name, brand, model, description, price, stock, image_url, specifications) 
SELECT 
  c.id,
  'ASUS PRIME B660M-A',
  'ASUS',
  'PRIME B660M-A',
  'Motherboard micro-ATX para Intel 12va gen con DDR4',
  16999.00,
  12,
  'https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg',
  '{"socket": "LGA1700", "chipset": "B660", "memory_type": "DDR4", "max_memory": "128GB", "memory_slots": 4, "form_factor": "mATX"}'
FROM categories c WHERE c.slug = 'motherboard';

-- RAM
INSERT INTO products (category_id, name, brand, model, description, price, stock, image_url, specifications) 
SELECT 
  c.id,
  'Corsair Vengeance LPX 16GB (2x8GB) DDR4-3200',
  'Corsair',
  'CMK16GX4M2B3200C16',
  'Kit de memoria DDR4 de alto rendimiento, ideal para gaming',
  12999.00,
  30,
  'https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg',
  '{"type": "DDR4", "capacity": "16GB", "kit": "2x8GB", "speed": "3200MHz", "cas_latency": "16", "voltage": "1.35V"}'
FROM categories c WHERE c.slug = 'ram';

-- GPUs
INSERT INTO products (category_id, name, brand, model, description, price, stock, image_url, specifications) 
SELECT 
  c.id,
  'NVIDIA GeForce RTX 4060 Ti',
  'NVIDIA',
  'RTX 4060 Ti',
  'Tarjeta gráfica de gama media-alta, ideal para 1440p gaming',
  89999.00,
  8,
  'https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg',
  '{"memory": "16GB GDDR6", "cuda_cores": 4352, "base_clock": "2310 MHz", "boost_clock": "2535 MHz", "memory_speed": "18 Gbps", "power_consumption": "165W"}'
FROM categories c WHERE c.slug = 'gpu';

INSERT INTO products (category_id, name, brand, model, description, price, stock, image_url, specifications) 
SELECT 
  c.id,
  'AMD Radeon RX 7600',
  'AMD',
  'RX 7600',
  'Tarjeta gráfica de gama media, excelente para 1080p y 1440p',
  67999.00,
  10,
  'https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg',
  '{"memory": "8GB GDDR6", "stream_processors": 2048, "base_clock": "1720 MHz", "boost_clock": "2625 MHz", "memory_speed": "18 Gbps", "power_consumption": "165W"}'
FROM categories c WHERE c.slug = 'gpu';

-- PSUs
INSERT INTO products (category_id, name, brand, model, description, price, stock, image_url, specifications) 
SELECT 
  c.id,
  'Corsair CV650 650W 80+ Bronze',
  'Corsair',
  'CV650',
  'Fuente de 650W con certificación 80+ Bronze, semi-modular',
  15999.00,
  18,
  'https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg',
  '{"wattage": "650W", "efficiency": "80+ Bronze", "modular": "Semi-modular", "pcie_connectors": 2, "sata_connectors": 6}'
FROM categories c WHERE c.slug = 'psu';

-- Gabinetes
INSERT INTO products (category_id, name, brand, model, description, price, stock, image_url, specifications) 
SELECT 
  c.id,
  'Cooler Master MasterBox Q300L',
  'Cooler Master',
  'Q300L',
  'Gabinete micro-ATX compacto con excelente ventilación',
  8999.00,
  22,
  'https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg',
  '{"form_factor": "mATX", "max_gpu_length": "360mm", "max_cpu_cooler": "158mm", "drive_bays": "2x3.5, 2x2.5", "fans_included": "1x120mm"}'
FROM categories c WHERE c.slug = 'gabinete';

-- SSDs
INSERT INTO products (category_id, name, brand, model, description, price, stock, image_url, specifications) 
SELECT 
  c.id,
  'Samsung 980 1TB NVMe SSD',
  'Samsung',
  '980',
  'SSD NVMe de alta velocidad para gaming y aplicaciones',
  19999.00,
  35,
  'https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg',
  '{"capacity": "1TB", "interface": "NVMe PCIe 3.0", "read_speed": "3500 MB/s", "write_speed": "3000 MB/s", "form_factor": "M.2 2280"}'
FROM categories c WHERE c.slug = 'ssd';

INSERT INTO products (category_id, name, brand, model, description, price, stock, image_url, specifications) 
SELECT 
  c.id,
  'Kingston NV2 500GB NVMe SSD',
  'Kingston',
  'NV2',
  'SSD NVMe económico con buen rendimiento para uso general',
  9999.00,
  28,
  'https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg',
  '{"capacity": "500GB", "interface": "NVMe PCIe 4.0", "read_speed": "3500 MB/s", "write_speed": "2100 MB/s", "form_factor": "M.2 2280"}'
FROM categories c WHERE c.slug = 'ssd';
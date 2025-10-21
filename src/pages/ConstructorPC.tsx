import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, CircuitBoard, Cpu, HardDrive, MemoryStick, Monitor, Zap, AlertCircle, Check, Plus, Minus } from 'lucide-react';
import { supabase, Product, Category } from '../utils/supabase';
import { useTiendaCarrito } from '../stores/tiendaCarrito';
import { useTiendaProductos } from '../stores/tiendaProductos';

const steps = [
  { icon: Cpu, label: 'CPU', description: 'Procesador', slug: 'cat-cpu' },
  { icon: CircuitBoard, label: 'Motherboard', description: 'Placa base', slug: 'cat-motherboard' },
  { icon: MemoryStick, label: 'RAM', description: 'Memoria', slug: 'cat-ram' },
  { icon: Monitor, label: 'GPU', description: 'Tarjeta grafica', slug: 'cat-gpu' },
  { icon: HardDrive, label: 'SSD', description: 'Almacenamiento', slug: 'cat-ssd' },
  { icon: Box, label: 'Gabinete', description: 'Case', slug: 'cat-case' },
  { icon: Zap, label: 'PSU', description: 'Fuente de poder', slug: 'cat-psu' },
];

interface ValidationErrors { [key: string]: string; }

interface SelectedComponents {
  [key: string]: {
    id: string;
    quantity: number;
    producto: Product;
  } | null;
}

const componentRestrictions = {
  'cat-cpu': { min: 1, max: 1, name: 'Procesador' },
  'cat-motherboard': { min: 1, max: 1, name: 'Placa madre' },
  'cat-ram': { min: 1, max: 2, name: 'Memoria RAM' },
  'cat-gpu': { min: 1, max: 1, name: 'Tarjeta gráfica' },
  'cat-psu': { min: 1, max: 1, name: 'Fuente de poder' },
  'cat-case': { min: 1, max: 1, name: 'Gabinete' },
  'cat-ssd': { min: 1, max: Infinity, name: 'Almacenamiento' },
};

export default function PCBuilderCompatibility() {
  const navigate = useNavigate();
  // Estado para el paso actual
  const [currentStep, setCurrentStep] = useState<number>(0);
  // Estado para los componentes seleccionados
  const [selectedComponents, setSelectedComponents] = useState<SelectedComponents>({});
  // Estado para los errores de validación
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  // Estado para mensajes de éxito
  const [successMessages, setSuccessMessages] = useState<{ [k: string]: string }>({});
  // Mapeo de slug (cat-*) a id real de categoría
  const [slugToCategoryId, setSlugToCategoryId] = useState<Record<string, string>>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const agregarAlCarrito = useTiendaCarrito(s => s.agregarAlCarrito);
  const { cargarProductos } = useTiendaProductos();

  // Función para reiniciar el armado
  const handleResetBuild = () => {
    setSelectedComponents({});
    setValidationErrors({});
    setSuccessMessages({});
    setCurrentStep(0);
  };

  useEffect(() => {
    const withTimeout = async <T,>(p: Promise<T>, ms = 15000): Promise<T> => {
      let timer: any;
      const timeout = new Promise<never>((_, rej) => { timer = setTimeout(() => rej(new Error('timeout')), ms); });
      try { return await Promise.race([p, timeout]); } finally { clearTimeout(timer); }
    };

    const load = async () => {
      try {
  const catRes: any = await withTimeout(Promise.resolve(supabase.from('categories').select('id, slug, name').then((r: any) => r)));
  const { data: catData, error: catErr } = catRes || {};
        if (catErr) {
          console.error('categories fetch error', catErr);
        } else if (catData) {
          setCategories(catData as Category[]);
          const map: Record<string, string> = {};
          catData.forEach((c: any) => map[c.slug] = c.id);
          setSlugToCategoryId(map);
        }

  const prodRes: any = await withTimeout(Promise.resolve(supabase.from('products').select('*').then((r: any) => r)));
        const { data: prodData, error: prodErr } = prodRes || {};
        if (prodErr) {
          console.error('products fetch error', prodErr);
        } else if (prodData) {
          setAllProducts(prodData as Product[]);
        }

  // Asegurarse de que `tiendaProductos` también esté poblado; usar await para evitar condiciones de carrera
        try { await cargarProductos(); } catch (err) { console.warn('cargarProductos failed from ConstructorPC', err); }
      } catch (err: any) {
        if (err?.message === 'timeout') console.error('ConstructorPC: Supabase request timed out');
        else console.error('ConstructorPC load error', err);
      }
    };

    load();
  }, [cargarProductos]);

  const getSpec = (product: Product | undefined, key: string): any => {
    if (!product) return undefined;
    const specs = product.specifications ?? {};
    if (specs.hasOwnProperty(key)) return specs[key];
    const lowerKey = key.toLowerCase();
    for (const k of Object.keys(specs)) {
      if (k.toLowerCase() === lowerKey) return specs[k];
    }
    return undefined;
  };

  const parseNumber = (val: any): number | undefined => {
    if (val == null) return undefined;
    if (typeof val === 'number') return val;
    if (typeof val === 'string') {
      const match = val.trim().match(/^(\d+)(?:\s*[wW])?/);
      if (match) return Number(match[1]);
    }
    return undefined;
  };

  // Compatibilidad
  const checkCompatibility = (product: Product): { compatible: boolean; reason?: string } => {
    const cpu = selectedComponents['cat-cpu']?.producto;
    const mb = selectedComponents['cat-motherboard']?.producto;
    const ram = selectedComponents['cat-ram']?.producto;
    const gpu = selectedComponents['cat-gpu']?.producto;
    const psu = selectedComponents['cat-psu']?.producto;

    const isCategory = (slug: string, prod: Product) => slugToCategoryId[slug] === prod.category_id;

    // CPU <-> Motherboard: socket
    if (cpu && isCategory('cat-motherboard', product)) {
      const socketMb = getSpec(product, 'socket').toUpperCase();
      const socketCpu = getSpec(cpu, 'socket').toUpperCase();
      if (socketMb && socketCpu && socketMb !== socketCpu) {
        return { compatible: false, reason: `Socket incompatible: ${socketMb} vs ${socketCpu}` };
      }
    }
    if (mb && isCategory('cat-cpu', product)) {
      const socketMb = getSpec(mb, 'socket');
      const socketCpu = getSpec(product, 'socket');
      if (socketMb && socketCpu && socketMb !== socketCpu) {
        return { compatible: false, reason: `Socket incompatible: ${socketCpu} vs ${socketMb}` };
      }
    }

    // RAM <-> Motherboard: DDR
    if (mb && isCategory('cat-ram', product)) {
      const memoryMb = getSpec(mb, 'memory_type');
      const memoryRam = getSpec(product, 'type');

      if (memoryMb && memoryRam) {
        const mbType = ('' + memoryMb).toUpperCase();
        const ramType = ('' + memoryRam).toUpperCase();
        const mbHasDDR4 = mbType.includes('DDR4');
        const mbHasDDR5 = mbType.includes('DDR5');
        const ramIsDDR4 = ramType.includes('DDR4');
        const ramIsDDR5 = ramType.includes('DDR5');

        if ((ramIsDDR4 && !mbHasDDR4) || (ramIsDDR5 && !mbHasDDR5)) {
          return { compatible: false, reason: `La memoria ${ramType} es incompatible con la mother` };
        }
      }
    }
    if (ram && isCategory('cat-motherboard', product)) {
      const memoryMb = getSpec(product, 'memory_type');
      const memoryRam = getSpec(ram, 'type');

      if (memoryMb && memoryRam) {
        const mbType = ('' + memoryMb).toUpperCase();
        const ramType = ('' + memoryRam).toUpperCase();
        const mbHasDDR4 = mbType.includes('DDR4');
        const mbHasDDR5 = mbType.includes('DDR5');
        const ramIsDDR4 = ramType.includes('DDR4');
        const ramIsDDR5 = ramType.includes('DDR5');

        if ((ramIsDDR4 && !mbHasDDR4) || (ramIsDDR5 && !mbHasDDR5)) {
          return { compatible: false, reason: `La mother es incompatible con memoria ${ramType}` };
        }
      }
    }

    // GPU <-> Case: tamaño
    if (gpu && isCategory('cat-case', product)) {
      const maxGpuLen = parseNumber(getSpec(product, 'max_gpu_length')) ?? 0;
      const gpuLen = 305;
      if (maxGpuLen < gpuLen) {
        return { compatible: false, reason: `La GPU necesita más espacio para este gabinete` };
      }
    }
    const gabinete = selectedComponents['cat-case']?.producto;
    if (gabinete && isCategory('cat-gpu', product)) {
      const maxGpuLen = parseNumber(getSpec(gabinete, 'max_gpu_length')) ?? 0;
      const gpuLen = 305;
      if (maxGpuLen < gpuLen) {
        return { compatible: false, reason: 'La GPU necesita más espacio en el gabinete seleccionado' };
      }
    }

    // PSU <-> Total Watts
    if (isCategory('cat-psu', product)) {
      const psuW = parseNumber(getSpec(product, 'wattage'));
      const totalWatts = calculateTotalWatts();
      if (psuW != null && totalWatts > psuW) {
        return {
          compatible: false,
          reason: `Fuente insuficiente: el sistema requiere ${totalWatts}W y la PSU es de ${psuW}W`,
        };
      }
    }
    if (psu && !isCategory('cat-psu', product)) {
      const psuW = parseNumber(getSpec(psu, 'wattage'));
      const estimatedWatts = calculateTotalWatts() + estimateExtraWatts(product);

      if (psuW != null && estimatedWatts > psuW) {
        return {
          compatible: false,
          reason: `La fuente actual (${psuW}W) no alcanza si agregás este componente (${estimatedWatts}W)`,
        };
      }
    }

    return { compatible: true };
  };

  // Calcular watts totales
  const calculateTotalWatts = (): number => {
    let total = 0;

    // CPU TDP
    const cpu = selectedComponents['cat-cpu']?.producto;
    if (cpu) {
      const tdp = parseNumber(getSpec(cpu, 'tdp'));
      if (tdp) total += tdp;
    }

    // GPU TDP
    const gpu = selectedComponents['cat-gpu']?.producto;
    if (gpu) {
      const tdp = parseNumber(getSpec(gpu, 'power_consumption'));
      if (tdp) total += tdp;
    }

    // Overhead estimado (motherboard, RAM, SSD, fans, etc.)
    const hasMotherboard = selectedComponents['cat-motherboard']?.producto;
    const ramCount = selectedComponents['cat-ram']?.quantity ?? 0;
    const ssdCount = selectedComponents['cat-ssd']?.quantity ?? 0;
    if (hasMotherboard) total += 50; // MB + chipset
    total += ramCount * 5; // ~5W por módulo RAM
    total += ssdCount * 5; // ~5W por SSD

    return Math.round(total);
  };

  // Calcular Watts a sumar
  const estimateExtraWatts = (product: Product): number => {
    const cat = Object.entries(slugToCategoryId).find(([, id]) => id === product.category_id)?.[0];

    if (!cat) return 0;
    if (cat === 'cat-cpu') return parseNumber(getSpec(product, 'tdp')) ?? 0;
    if (cat === 'cat-gpu') return parseNumber(getSpec(product, 'tdp') || getSpec(product, 'power_consumption')) ?? 0;
    if (cat === 'cat-ram') return 5;
    if (cat === 'cat-ssd') return 5;
    if (cat === 'cat-motherboard') return 50;
    return 0;
  };

  // --- Selección / cantidades (guardamos producto completo al seleccionar) ---
  const handleComponentSelect = (categorySlug: string, product: Product, quantity = 1) => {
    if (quantity > (product.stock ?? 0)) {
      setValidationErrors(prev => ({ ...prev, [product.id]: `Solo ${product.stock} disponibles` }));
      return;
    }
    setSelectedComponents(prev => ({ ...prev, [categorySlug]: { id: product.id, quantity, producto: product } }));
    setValidationErrors(prev => { const c = { ...prev }; delete c[product.id]; return c; });
    setSuccessMessages(prev => ({ ...prev, [product.id]: 'Seleccionado' }));
    setTimeout(() => setSuccessMessages(prev => { const c = { ...prev }; delete c[product.id]; return c; }), 3000);
  };

  const handleIncreaseQuantity = (categorySlug: string) => {
    const comp = selectedComponents[categorySlug];
    if (!comp) return;
    const max = componentRestrictions[categorySlug as keyof typeof componentRestrictions]?.max ?? Infinity;
    const newQ = comp.quantity + 1;
    if (newQ > max) return;
    if ((comp.producto.stock ?? 0) < newQ) {
      setValidationErrors(prev => ({ ...prev, [comp.id]: `Solo ${comp.producto.stock} disponibles` }));
      return;
    }
    setSelectedComponents(prev => ({ ...prev, [categorySlug]: { ...comp, quantity: newQ } }));
  };

  const handleDecreaseQuantity = (categorySlug: string, removeAll = false) => {
    const comp = selectedComponents[categorySlug];
    if (!comp) return;
    if (removeAll || comp.quantity <= 1) {
      setSelectedComponents(prev => { const copy = { ...prev }; delete copy[categorySlug]; return copy; });
    } else {
      setSelectedComponents(prev => ({ ...prev, [categorySlug]: { ...comp, quantity: comp.quantity - 1 } }));
    }
    setValidationErrors(prev => { const c = { ...prev }; delete c[comp.id]; return c; });
  };

  const handleAddToCart = async () => {
    // Validar que todos los componentes requeridos estén seleccionados
    const missing: string[] = [];
    Object.entries(componentRestrictions).forEach(([slug, restr]) => {
      const comp = selectedComponents[slug];
      if (!comp || comp.quantity < restr.min) {
        missing.push(restr.name);
      }
    });
    if (missing.length > 0) {
      setValidationErrors(prev => ({ ...prev, general: `Faltan seleccionar: ${missing.join(', ')}` }));
      setTimeout(() => setValidationErrors(prev => { const c = { ...prev }; delete c.general; return c; }), 3000);
      return;
    }
    // Validar que la cantidad máxima de watts no exceda la de la fuente
    const psu = selectedComponents['cat-psu']?.producto;
    const psuWatts = psu ? parseNumber(getSpec(psu, 'wattage')) : undefined;
    const totalWatts = calculateTotalWatts();
    if (psuWatts != null && totalWatts > psuWatts) {
      setValidationErrors(prev => ({
        ...prev,
        general: `El consumo estimado (${totalWatts}W) excede la capacidad de la fuente (${psuWatts}W)`
      }));
    }
    Object.values(selectedComponents).forEach(c => {
      if (c) agregarAlCarrito(c.id, c.quantity);
    });
    setSuccessMessages({ form: 'Componentes agregados al carrito' });
    setTimeout(() => {
      setSuccessMessages({});
      navigate('/carrito');
    }, 1000);
  };

  const currentSlug = steps[currentStep]?.slug;
  const currentCategoryId = slugToCategoryId[currentSlug] ?? null;
  const currentCategoryProducts = currentCategoryId
    ? (() => {
      const products = allProducts.filter(p => p.category_id === currentCategoryId);
      const compatibles = products.filter(p => checkCompatibility(p).compatible);
      const incompatibles = products.filter(p => !checkCompatibility(p).compatible);

      compatibles.sort((a, b) => a.price - b.price);
      incompatibles.sort((a, b) => a.price - b.price);

      return [...compatibles, ...incompatibles];
    })()
    : [];
  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-12 space-y-4 text-center text-slate-900 dark:text-slate-100">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">Construí tu PC</p>
        <h1 className="text-4xl font-semibold">PC Builder</h1>
        <p className="mx-auto max-w-2xl text-sm text-slate-500 dark:text-slate-400">
          Estamos preparando nuestro PC Builder para CPU, memoria, gabinetes y mucho más!. Mientras tanto podés llenar tu carrito con el catálogo actual.
        </p>
      </header>

      {validationErrors.general && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-300">
          <div className="flex items-center">
            <AlertCircle className="mr-2 h-4 w-4" />
            <span>{validationErrors.general}</span>
          </div>
        </div>
      )}

      {successMessages.form && (
        <div className="mb-4 rounded-lg bg-green-50 p-4 text-sm text-green-800 dark:bg-green-900/30 dark:text-green-300">
          <div className="flex items-center">
            <Check className="mr-2 h-4 w-4" />
            <span>{successMessages.form}</span>
          </div>
        </div>
      )}
      
      <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 text-xl font-semibold text-slate-900 dark:text-slate-100">Consumo estimado</h2>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600 dark:text-slate-400">Watts totales estimados:</span>
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{calculateTotalWatts()}W</span>
          </div>
          {selectedComponents['cat-psu']?.producto && (
            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/60">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">PSU seleccionada:</span>
                <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {parseNumber(getSpec(selectedComponents['cat-psu'].producto, 'wattage'))}W
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-7">
        {steps.map((step, i) => {
          const key = step.slug;
          const sel = selectedComponents[key];
          return (
            <article
              key={key}
              onClick={() => setCurrentStep(i)}
              className={`flex cursor-pointer flex-col items-center rounded-xl border p-4 text-center transition-colors
    ${currentStep === i
                  ? 'border-blue-500 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/20'
                  : (!selectedComponents[key] || selectedComponents[key]?.quantity === 0)
                    ? 'border-red-500 bg-red-50 dark:border-red-700 dark:bg-red-900/20'
                    : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
                }`}
            >

              <span className={`mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full 
              ${currentStep === i

                  ? 'bg-blue-500 text-white dark:bg-blue-600'
                  : 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                }`}>
                <step.icon className="h-5 w-5" />
              </span>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{step.label}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{step.description}</p>
              {sel && (
                <span className="mt-1 inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300">
                  <Check className="mr-1 h-3 w-3" />
                  {sel.quantity > 1 ? `${sel.quantity} unidades` : 'Seleccionado'}
                </span>
              )}
            </article>
          );
        })}
      </div>

      {currentCategoryProducts.length > 0 && (
        <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-4 text-xl font-semibold text-slate-900 dark:text-slate-100">
            Selecciona tu {steps[currentStep]?.description}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {currentCategoryProducts.map(product => {
              const compat = checkCompatibility(product);
              const compatible = compat.compatible;
              const slugKey = currentSlug;
              const isSelected = selectedComponents[slugKey]?.id === product.id;
              const curQty = selectedComponents[slugKey]?.quantity ?? 0;
              const restrictions = componentRestrictions[slugKey as keyof typeof componentRestrictions];
              const selectedQuantity = isSelected ? curQty : 0;
              const stockDisponible = product.stock - selectedQuantity;

              return (
                <div
                  key={product.id}
                  className={`rounded-xl border p-4 transition-colors 
                    ${!compatible
                      ? 'opacity-50 pointer-events-none grayscale border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60'
                      : isSelected
                        ? 'border-blue-500 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/20'
                        : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60'
                    }`}>
                  <h3 className="font-medium text-slate-900 dark:text-slate-100">{product.name}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{product.brand} {product.model}</p>
                  <p className="mt-2 font-semibold text-slate-900 dark:text-slate-100">
                    ${product.price?.toLocaleString?.('es-AR') ?? product.price}
                  </p>
                  <p className={`mt-1 text-xs ${stockDisponible > 5
                    ? 'text-green-600 dark:text-green-400'
                    : stockDisponible > 0
                      ? 'text-yellow-600 dark:text-yellow-400'
                      : 'text-red-600 dark:text-red-400'
                    }`}>
                    {stockDisponible > 5
                      ? `En stock (${stockDisponible})`
                      : stockDisponible > 0
                        ? `Pocas unidades (${stockDisponible})`
                        : 'Sin stock'}
                  </p>
                  {restrictions && (
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                      {restrictions.min === restrictions.max ?
                        `Exactamente ${restrictions.min} ${restrictions.name.toLowerCase()}` :
                        restrictions.max === Infinity ?
                          `Mínimo ${restrictions.min} unidad(es)` :
                          `Mínimo ${restrictions.min}, máximo ${restrictions.max} unidad(es)`
                      }
                    </p>
                  )}
                  {!compatible && (
                    <div className="mt-3 rounded-lg border border-red-300 bg-red-50 p-3 dark:border-red-700 dark:bg-red-900/30">
                      <div className="flex items-start">
                        <AlertCircle className="mr-2 mt-0.5 h-4 w-4 flex-shrink-0 text-red-600 dark:text-red-400" />
                        <div className="flex-1">
                          <p className="text-sm font-bold text-red-700 dark:text-red-400">No compatible</p>
                          <p className="mt-1 text-xs leading-relaxed text-red-600 dark:text-red-300">{compat.reason}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  {compatible && (
                    <>
                      {isSelected ? (
                        <div className="mt-3">
                          {restrictions?.max === 1 ? (
                            <button
                              onClick={() => handleDecreaseQuantity(slugKey, true)}
                              className="w-full rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
                            >
                              Eliminar
                            </button>
                          ) : (
                            <>
                              <div className="flex items-center justify-between">
                                <button
                                  className={`rounded-md bg-slate-200 px-3 py-1 text-sm font-medium dark:bg-slate-700 
                                    ${curQty <= 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                  onClick={() => handleDecreaseQuantity(slugKey)}
                                  disabled={curQty <= 1}>
                                  <Minus size={16} />
                                </button>
                                <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{curQty}</span>
                                <button
                                  className={`rounded-md bg-slate-200 px-3 py-1 text-sm font-medium dark:bg-slate-700 
                                    ${curQty >= Math.min(product.stock, restrictions?.max ?? Infinity)
                                      ? 'opacity-50 cursor-not-allowed'
                                      : ''
                                    }`}
                                  onClick={() => handleIncreaseQuantity(slugKey)}
                                  disabled={curQty >= Math.min(product.stock, restrictions?.max ?? Infinity)}>
                                  <Plus size={16} />
                                </button>
                              </div>
                              <button
                                onClick={() => handleDecreaseQuantity(slugKey, true)}
                                className="mt-2 w-full rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
                              >Eliminar</button>
                            </>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={() => handleComponentSelect(slugKey, product, 1)}
                          className={`mt-4 w-full rounded-lg px-4 py-2 text-sm font-medium ${product.stock === 0
                            ? 'cursor-not-allowed bg-slate-300 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                            : 'bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700'
                            }`}
                          disabled={product.stock === 0}>Seleccionar</button>
                      )}
                    </>
                  )}
                  {validationErrors[product.id] && (
                    <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                      <AlertCircle className="mr-1 inline h-3 w-3" />
                      {validationErrors[product.id]}
                    </p>
                  )}
                  {successMessages[product.id] && (
                    <p className="mt-2 text-xs text-green-600 dark:text-green-400">
                      <Check className="mr-1 inline h-3 w-3" />
                      {successMessages[product.id]}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col items-center gap-3">
        <button onClick={handleAddToCart} className="w-full rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 
        dark:bg-blue-600 dark:hover:bg-blue-700">Agregar al carrito</button>
        <button onClick={handleResetBuild} className="w-full rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 
        dark:bg-red-600 dark:hover:bg-red-700">Reiniciar armado</button>
      </div>
    </section>
  );
}
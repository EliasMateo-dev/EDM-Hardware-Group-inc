import React, { useState, useEffect } from 'react';
import { Box, CircuitBoard, Cpu, HardDrive, MemoryStick, Monitor, Zap, AlertCircle, Check, Plus, Minus } from 'lucide-react';
import { useTiendaProductos } from '../stores/tiendaProductos';
import { useTiendaCarrito } from '../stores/tiendaCarrito';

const steps = [
  { icon: Cpu, label: 'CPU', description: 'Procesador', categoryId: 'cat-cpu' },
  { icon: CircuitBoard, label: 'Motherboard', description: 'Placa base', categoryId: 'cat-motherboard' },
  { icon: MemoryStick, label: 'RAM', description: 'Memoria', categoryId: 'cat-ram' },
  { icon: Monitor, label: 'GPU', description: 'Tarjeta grafica', categoryId: 'cat-gpu' },
  { icon: Zap, label: 'PSU', description: 'Fuente de poder', categoryId: 'cat-psu' },
  { icon: Box, label: 'Gabinete', description: 'Case', categoryId: 'cat-case' },
  { icon: HardDrive, label: 'SSD', description: 'Almacenamiento', categoryId: 'cat-ssd' },
];

// Interfaz para los errores de validación
interface ValidationErrors {
  [key: string]: string;
}

// Interfaz para los componentes seleccionados
interface SelectedComponents {
  [key: string]: {
    id: string;
    quantity: number;
  } | null;
}

// Restricciones de selección para cada categoría
const componentRestrictions = {
  'cat-cpu': { min: 1, max: 1, name: 'Procesador' },
  'cat-motherboard': { min: 1, max: 1, name: 'Placa madre' },
  'cat-ram': { min: 1, max: 2, name: 'Memoria RAM' },
  'cat-gpu': { min: 1, max: 1, name: 'Tarjeta gráfica' },
  'cat-psu': { min: 1, max: 1, name: 'Fuente de poder' },
  'cat-case': { min: 1, max: 1, name: 'Gabinete' },
  'cat-ssd': { min: 0, max: Infinity, name: 'Almacenamiento' },
};

export default function PCBuilder() {
  // Estado para el paso actual
  const [currentStep, setCurrentStep] = useState<number>(0);
  // Estado para los componentes seleccionados
  const [selectedComponents, setSelectedComponents] = useState<SelectedComponents>({});
  // Estado para los errores de validación
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  // Estado para mensajes de éxito
  const [successMessages, setSuccessMessages] = useState<{[key: string]: string}>({});
  // Estado para componentes con error (resaltados)
  const [highlightedErrors, setHighlightedErrors] = useState<{[key: string]: boolean}>({});
  // Estado para el formulario de datos del usuario
  const [userData, setUserData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    direccion: '',
  });
  // Estado para indicar si el formulario ha sido enviado
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Obtener productos y carrito de las tiendas
  const { productos, cargarProductos } = useTiendaProductos();
  const { agregarAlCarrito } = useTiendaCarrito();

  // Cargar productos al montar el componente
  useEffect(() => {
    cargarProductos();
  }, [cargarProductos]);

  // Validar inventario al seleccionar un componente
  const validateInventory = (productId: string, quantity: number): boolean => {
    const product = productos.find(p => p.id === productId);
    
    if (!product) {
      setValidationErrors({
        ...validationErrors,
        [productId]: 'Producto no encontrado'
      });
      return false;
    }

    if (quantity > product.existencias) {
      setValidationErrors({
        ...validationErrors,
        [productId]: `Solo hay ${product.existencias} unidades disponibles`
      });
      return false;
    }

    // Limpiar error si existe
    const newErrors = {...validationErrors};
    delete newErrors[productId];
    setValidationErrors(newErrors);
    
    // Mostrar mensaje de éxito
    setSuccessMessages({
      ...successMessages,
      [productId]: 'Producto agregado correctamente'
    });
    
    // Limpiar mensaje de éxito después de 3 segundos
    setTimeout(() => {
      setSuccessMessages(prev => {
        const newMessages = {...prev};
        delete newMessages[productId];
        return newMessages;
      });
    }, 3000);
    
    return true;
  };

  // Validar campos de formulario
  const validateFormField = (field: string, value: string): boolean => {
    let isValid = true;
    const newErrors = {...validationErrors};
    
    switch (field) {
      case 'nombre':
        if (!value.trim()) {
          newErrors[field] = 'El nombre es obligatorio';
          isValid = false;
        } else if (value.length < 3) {
          newErrors[field] = 'El nombre debe tener al menos 3 caracteres';
          isValid = false;
        } else {
          delete newErrors[field];
        }
        break;
        
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value.trim()) {
          newErrors[field] = 'El email es obligatorio';
          isValid = false;
        } else if (!emailRegex.test(value)) {
          newErrors[field] = 'Formato de email inválido';
          isValid = false;
        } else {
          delete newErrors[field];
        }
        break;
        
      case 'telefono':
        const phoneRegex = /^\d{10,15}$/;
        if (value && !phoneRegex.test(value.replace(/\D/g, ''))) {
          newErrors[field] = 'Formato de teléfono inválido';
          isValid = false;
        } else {
          delete newErrors[field];
        }
        break;
        
      case 'direccion':
        if (!value.trim()) {
          newErrors[field] = 'La dirección es obligatoria';
          isValid = false;
        } else if (value.length < 5) {
          newErrors[field] = 'La dirección debe tener al menos 5 caracteres';
          isValid = false;
        } else {
          delete newErrors[field];
        }
        break;
        
      default:
        break;
    }
    
    setValidationErrors(newErrors);
    return isValid;
  };

  // Validar reglas de negocio
  const validateBusinessRules = (): boolean => {
    let isValid = true;
    const newErrors = {...validationErrors};
    
    // Validar compatibilidad de componentes
    const cpu = selectedComponents['cat-cpu'];
    const motherboard = selectedComponents['cat-motherboard'];
    
    if (cpu && motherboard) {
      const cpuProduct = productos.find(p => p.id === cpu.id);
      const mbProduct = productos.find(p => p.id === motherboard.id);
      
      if (cpuProduct && mbProduct) {
        // Ejemplo: Validar socket compatible
        if (cpuProduct.especificaciones.socket !== mbProduct.especificaciones.socket) {
          newErrors['compatibility'] = `El socket del CPU (${cpuProduct.especificaciones.socket}) no es compatible con la placa base (${mbProduct.especificaciones.socket})`;
          isValid = false;
        } else {
          delete newErrors['compatibility'];
        }
      }
    }
    
    // Validar restricciones de cantidad para cada categoría
    Object.entries(componentRestrictions).forEach(([categoryId, restriction]) => {
      const components = selectedComponents[categoryId];
      if (components) {
        const quantity = components.quantity;
        if (quantity > restriction.max) {
          newErrors[`${categoryId}_limit`] = `Máximo ${restriction.max} ${restriction.name.toLowerCase()} permitido`;
          isValid = false;
        } else {
          delete newErrors[`${categoryId}_limit`];
        }
      }
    });
    
    setValidationErrors(newErrors);
    return isValid;
  };

  // Manejar selección de componente
  const handleComponentSelect = (categoryId: string, productId: string, quantity: number = 1) => {
    // Validar inventario
    if (!validateInventory(productId, quantity)) {
      return;
    }
    
    // Verificar restricciones de cantidad
    const restrictions = componentRestrictions[categoryId as keyof typeof componentRestrictions];
    if (restrictions && quantity > restrictions.max) {
      setValidationErrors({
        ...validationErrors,
        [`${categoryId}_limit`]: `Máximo ${restrictions.max} ${restrictions.name.toLowerCase()} permitido`
      });
      return;
    }
    
    // Actualizar componentes seleccionados
    setSelectedComponents({
      ...selectedComponents,
      [categoryId]: { id: productId, quantity }
    });
    
    // Validar reglas de negocio
    validateBusinessRules();
  };
  
  // Función para aumentar la cantidad de un componente
  const handleIncreaseQuantity = (productId: string, categoryId: string) => {
    const component = selectedComponents[categoryId];
    if (!component || component.id !== productId) return;
    
    const product = productos.find(p => p.id === productId);
    if (!product) return;
    
    const restriction = componentRestrictions[categoryId as keyof typeof componentRestrictions];
    const newQuantity = component.quantity + 1;
    
    // Verificar si excede el máximo permitido
    if (restriction && newQuantity > restriction.max && restriction.max !== Infinity) {
      setValidationErrors(prev => ({
        ...prev,
        [productId]: `Puedes seleccionar máximo ${restriction.max} ${restriction.name.toLowerCase()}`
      }));
      return;
    }
    
    // Verificar si hay suficiente stock
    if (product.existencias < newQuantity) {
      setValidationErrors(prev => ({
        ...prev,
        [productId]: `Solo hay ${product.existencias} unidades disponibles`
      }));
      return;
    }
    
    // Actualizar la cantidad
    setSelectedComponents(prev => ({
      ...prev,
      [categoryId]: { ...component, quantity: newQuantity }
    }));
    
    // Limpiar error si existe
    if (validationErrors[productId]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[productId];
        return newErrors;
      });
    }
    
    // Validar reglas de negocio
    validateBusinessRules();
  };

  // Función para disminuir la cantidad de un componente
  const handleDecreaseQuantity = (productId: string, categoryId: string) => {
    const component = selectedComponents[categoryId];
    if (!component || component.id !== productId) return;
    
    const newQuantity = component.quantity - 1;
    
    if (newQuantity <= 0) {
      // Si la cantidad llega a 0, eliminamos el componente
      setSelectedComponents(prev => {
        const newComponents = { ...prev };
        delete newComponents[categoryId];
        return newComponents;
      });
    } else {
      // Actualizar la cantidad
      setSelectedComponents(prev => ({
        ...prev,
        [categoryId]: { ...component, quantity: newQuantity }
      }));
    }
    
    // Limpiar error si existe
    if (validationErrors[productId]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[productId];
        return newErrors;
      });
    }
    
    // Validar reglas de negocio
    validateBusinessRules();
  };

  // Manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value
    });
    
    // Validar campo
    validateFormField(name, value);
  };

  // Manejar envío del formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    setHighlightedErrors({});
    
    // Limpiar mensajes de éxito anteriores
    const newSuccessMessages = {...successMessages};
    delete newSuccessMessages.form;
    setSuccessMessages(newSuccessMessages);
    
    // Validar todos los campos
    let isValid = true;
    Object.entries(userData).forEach(([field, value]) => {
      if (!validateFormField(field, value)) {
        isValid = false;
      }
    });
    
    // Validar reglas de negocio
    if (!validateBusinessRules()) {
      isValid = false;
    }
    
    // Verificar que se hayan seleccionado los componentes requeridos según las restricciones
    const missingComponents: string[] = [];
    
    Object.entries(componentRestrictions).forEach(([categoryId, restriction]) => {
      const component = selectedComponents[categoryId];
      const count = component ? component.quantity : 0;
      
      if (count < restriction.min && restriction.min > 0) {
        setValidationErrors(prev => ({
          ...prev,
          [`${categoryId}_required`]: `Debes seleccionar al menos ${restriction.min} ${restriction.name.toLowerCase()}`
        }));
        missingComponents.push(restriction.name);
        setHighlightedErrors(prev => ({ ...prev, [categoryId]: true }));
        isValid = false;
      } else if (count > restriction.max && restriction.max !== Infinity) {
        setValidationErrors(prev => ({
          ...prev,
          [`${categoryId}_limit`]: `Máximo ${restriction.max} ${restriction.name.toLowerCase()} permitido`
        }));
        isValid = false;
      }
    });
    
    // Si hay componentes faltantes, mostrar mensaje general
    if (missingComponents.length > 0) {
      const missingMessage = `Faltan por seleccionar: ${missingComponents.join(', ')}`;
      setValidationErrors(prev => ({ ...prev, general: missingMessage }));
      
      // Eliminar el resaltado después de 6 segundos
      setTimeout(() => {
        setHighlightedErrors({});
      }, 6000);
    }
    
    if (isValid) {
      // Verificar stock antes de agregar al carrito
      let allInStock = true;
      const newErrors = {...validationErrors};
      
      Object.entries(selectedComponents).forEach(([categoryId, component]) => {
        if (component) {
          const product = productos.find(p => p.id === component.id);
          if (product && product.existencias < component.quantity) {
            newErrors[product.id] = `Solo hay ${product.existencias} unidades disponibles`;
            allInStock = false;
          }
        }
      });
      
      if (!allInStock) {
        setValidationErrors(newErrors);
        return;
      }
      
      try {
        // Agregar componentes al carrito
        Object.values(selectedComponents).forEach(component => {
          if (component) {
            console.log(`Agregando al carrito: ${component.id}, cantidad: ${component.quantity}`);
            agregarAlCarrito(component.id, component.quantity);
          }
        });
        
        // Mostrar mensaje de éxito
        setSuccessMessages({
          ...successMessages,
          form: 'Todos los productos se han agregado correctamente al carrito',
          cart: 'Componentes agregados al carrito correctamente'
        });
        
        // Redirigir al carrito después de 3 segundos
        setTimeout(() => {
          window.location.href = '/carrito';
        }, 3000);
        
        // Limpiar formulario
        setSelectedComponents({});
        setUserData({
          nombre: '',
          email: '',
          telefono: '',
          direccion: ''
        });
        setFormSubmitted(false);
        setValidationErrors({});
      } catch (error) {
        console.error('Error al agregar al carrito:', error);
        setValidationErrors(prev => ({
          ...prev,
          general: 'Error al agregar al carrito. Por favor, intenta de nuevo.'
        }));
      }
    }
  };

  // Filtrar productos por categoría actual
  const currentCategoryId = steps[currentStep]?.categoryId;
  const currentCategoryProducts = productos.filter(p => p.categoriaId === currentCategoryId);

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-12 space-y-4 text-center text-slate-900 dark:text-slate-100">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">Contruí tu PC</p>
        <h1 className="text-4xl font-semibold">PC Builder</h1>
        <p className="mx-auto max-w-2xl text-sm text-slate-500 dark:text-slate-400">
          Estamos preparando nuestro PC Builder para CPU, memoria, gabinetes y mucho más!. Mientras tanto podés llenar tu carrito con el catálogo actual.
        </p>
      </header>

      {/* Mensajes de error generales */}
      {validationErrors.general && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-300">
          <div className="flex items-center">
            <AlertCircle className="mr-2 h-4 w-4" />
            <span>{validationErrors.general}</span>
          </div>
        </div>
      )}

      {/* Mensajes de éxito generales */}
      {successMessages.form && (
        <div className="mb-4 rounded-lg bg-green-50 p-4 text-sm text-green-800 dark:bg-green-900/30 dark:text-green-300">
          <div className="flex items-center">
            <Check className="mr-2 h-4 w-4" />
            <span>{successMessages.form}</span>
          </div>
        </div>
      )}

      {/* Errores de compatibilidad */}
      {validationErrors.compatibility && (
        <div className="mb-4 rounded-lg bg-yellow-50 p-4 text-sm text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
          <div className="flex items-center">
            <AlertCircle className="mr-2 h-4 w-4" />
            <span>{validationErrors.compatibility}</span>
          </div>
        </div>
      )}

      {/* Errores de límite de compra */}
      {validationErrors.purchase_limit && (
        <div className="mb-4 rounded-lg bg-yellow-50 p-4 text-sm text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
          <div className="flex items-center">
            <AlertCircle className="mr-2 h-4 w-4" />
            <span>{validationErrors.purchase_limit}</span>
          </div>
        </div>
      )}

      <div className="mb-12 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Lo que esta en proceso</h2>
        <ul className="mt-6 grid gap-4 text-sm text-slate-600 dark:text-slate-300 sm:grid-cols-2">
          <li className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 transition-colors dark:border-slate-800 dark:bg-slate-800/60">Compatibilidad de socket y chipset al instante.</li>
          <li className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 transition-colors dark:border-slate-800 dark:bg-slate-800/60">Validacion de memoria DDR4 o DDR5 y cantidad maxima.</li>
          <li className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 transition-colors dark:border-slate-800 dark:bg-slate-800/60">Calculo automatico de potencia recomendada para la PSU.</li>
          <li className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 transition-colors dark:border-slate-800 dark:bg-slate-800/60">Verificacion de espacio para placas de video y cooling.</li>
          <li className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 transition-colors dark:border-slate-800 dark:bg-slate-800/60">Alertas de cuellos de botella segun CPU y GPU elegidos.</li>
          <li className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 transition-colors dark:border-slate-800 dark:bg-slate-800/60">Sugerencias de upgrades rapidos segun tu presupuesto.</li>
        </ul>
      </div>

      {/* Pasos del constructor */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-7">
        {steps.map((step, index) => (
          <article 
            key={index} 
            className={`flex cursor-pointer flex-col items-center rounded-xl border p-4 text-center transition-colors ${
              highlightedErrors[step.categoryId] 
                ? 'border-red-500 bg-red-50 dark:border-red-700 dark:bg-red-900/20' 
                : currentStep === index 
                  ? 'border-blue-500 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/20' 
                  : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
            }`}
            onClick={() => setCurrentStep(index)}
          >
            <span className={`mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full ${
              currentStep === index 
                ? 'bg-blue-500 text-white dark:bg-blue-600' 
                : 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
            }`}>
              <step.icon className="h-5 w-5" />
            </span>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{step.label}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">{step.description}</p>
            
            {/* Indicador de componente seleccionado */}
            {selectedComponents[step.categoryId] && (
              <span className="mt-1 inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300">
                <Check className="mr-1 h-3 w-3" />
                {selectedComponents[step.categoryId]?.quantity > 1 ? 
                  `${selectedComponents[step.categoryId]?.quantity} unidades` : 
                  'Seleccionado'}
              </span>
            )}
          </article>
        ))}
      </div>

      {/* Productos de la categoría actual */}
      {currentCategoryProducts.length > 0 && (
        <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-4 text-xl font-semibold text-slate-900 dark:text-slate-100">
            Selecciona tu {steps[currentStep]?.description}
          </h2>
          
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {currentCategoryProducts.map(product => {
              const isSelected = selectedComponents[currentCategoryId]?.id === product.id;
              const currentQuantity = selectedComponents[currentCategoryId]?.quantity || 0;
              const restrictions = componentRestrictions[currentCategoryId as keyof typeof componentRestrictions];
              
              return (
                <div 
                  key={product.id}
                  className={`rounded-xl border p-4 transition-colors ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/20'
                      : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60'
                  }`}
                >
                  <h3 className="font-medium text-slate-900 dark:text-slate-100">{product.nombre}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{product.marca} {product.modelo}</p>
                  <p className="mt-2 font-semibold text-slate-900 dark:text-slate-100">
                    ${product.precio.toLocaleString('es-AR')}
                  </p>
                  
                  {/* Inventario */}
                  <p className={`mt-1 text-xs ${
                    product.existencias > 5 
                      ? 'text-green-600 dark:text-green-400' 
                      : product.existencias > 0 
                        ? 'text-yellow-600 dark:text-yellow-400' 
                        : 'text-red-600 dark:text-red-400'
                  }`}>
                    {product.existencias > 5 
                      ? `En stock (${product.existencias})` 
                      : product.existencias > 0 
                        ? `Pocas unidades (${product.existencias})` 
                        : 'Sin stock'}
                  </p>
                  
                  {/* Restricciones de cantidad */}
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
                  
                  {isSelected ? (
                    <div className="mt-3 flex items-center justify-between">
                      <button 
                        className="rounded-md bg-slate-200 px-3 py-1 text-sm font-medium dark:bg-slate-700"
                        onClick={() => handleDecreaseQuantity(product.id, currentCategoryId)}
                      >
                        <Minus size={16} />
                      </button>
                      <span className="text-sm font-medium">{currentQuantity}</span>
                      <button 
                        className="rounded-md bg-slate-200 px-3 py-1 text-sm font-medium dark:bg-slate-700"
                        onClick={() => handleIncreaseQuantity(product.id, currentCategoryId)}
                        disabled={currentQuantity >= Math.min(product.existencias, restrictions?.max || Infinity)}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  ) : (
                    <button
                      className={`mt-4 w-full rounded-lg px-4 py-2 text-sm font-medium ${
                        product.existencias === 0
                          ? 'cursor-not-allowed bg-slate-300 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                          : 'bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700'
                      }`}
                      onClick={() => handleComponentSelect(currentCategoryId, product.id)}
                      disabled={product.existencias === 0}
                    >
                      Seleccionar
                    </button>
                  )}
                  
                  {/* Mensaje de error */}
                  {validationErrors[product.id] && (
                    <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                      <AlertCircle className="mr-1 inline h-3 w-3" />
                      {validationErrors[product.id]}
                    </p>
                  )}
                  
                  {/* Mensaje de éxito */}
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

      {/* Formulario de datos del usuario */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 text-xl font-semibold text-slate-900 dark:text-slate-100">
          Datos de contacto
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="nombre" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Nombre completo *
            </label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={userData.nombre}
              onChange={handleInputChange}
              className={`w-full rounded-lg border p-2 ${
                formSubmitted && validationErrors.nombre
                  ? 'border-red-500 bg-red-50 dark:border-red-700 dark:bg-red-900/20'
                  : 'border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-800'
              }`}
            />
            {formSubmitted && validationErrors.nombre && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                <AlertCircle className="mr-1 inline h-3 w-3" />
                {validationErrors.nombre}
              </p>
            )}
          </div>
          
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={userData.email}
              onChange={handleInputChange}
              className={`w-full rounded-lg border p-2 ${
                formSubmitted && validationErrors.email
                  ? 'border-red-500 bg-red-50 dark:border-red-700 dark:bg-red-900/20'
                  : 'border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-800'
              }`}
            />
            {formSubmitted && validationErrors.email && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                <AlertCircle className="mr-1 inline h-3 w-3" />
                {validationErrors.email}
              </p>
            )}
          </div>
          
          <div>
            <label htmlFor="telefono" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Teléfono
            </label>
            <input
              type="tel"
              id="telefono"
              name="telefono"
              value={userData.telefono}
              onChange={handleInputChange}
              className={`w-full rounded-lg border p-2 ${
                formSubmitted && validationErrors.telefono
                  ? 'border-red-500 bg-red-50 dark:border-red-700 dark:bg-red-900/20'
                  : 'border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-800'
              }`}
            />
            {formSubmitted && validationErrors.telefono && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                <AlertCircle className="mr-1 inline h-3 w-3" />
                {validationErrors.telefono}
              </p>
            )}
          </div>
          
          <div>
            <label htmlFor="direccion" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Dirección *
            </label>
            <input
              type="text"
              id="direccion"
              name="direccion"
              value={userData.direccion}
              onChange={handleInputChange}
              className={`w-full rounded-lg border p-2 ${
                formSubmitted && validationErrors.direccion
                  ? 'border-red-500 bg-red-50 dark:border-red-700 dark:bg-red-900/20'
                  : 'border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-800'
              }`}
            />
            {formSubmitted && validationErrors.direccion && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                <AlertCircle className="mr-1 inline h-3 w-3" />
                {validationErrors.direccion}
              </p>
            )}
          </div>
          
          <button
            type="submit"
            className="w-full rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            Agregar al carrito
          </button>
        </form>
      </div>
    </section>
  );
}

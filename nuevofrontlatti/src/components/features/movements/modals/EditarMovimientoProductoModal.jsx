import React, { useState, useEffect, useRef } from 'react';
import { FaPlus, FaTrash, FaBox, FaCalendarAlt, FaTag } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { updateMovimientoProducto } from '../../../../store/actions/movimientoProductoActions';
import { loadProductos } from '../../../../store/actions/productosActions';
import { useGlobalUpdate } from '../../../../hooks/useGlobalUpdate';
import FormModal from '../../../ui/FormModal';
import Button from '../../../ui/Button';
import Input from '../../../ui/Input';
import NumberInput from '../../../ui/NumberInput';
import { formatDateToLocalString } from '../../../../utils/formatters';

const EditarMovimientoProductoModal = ({ isOpen, onClose, movimiento, onSuccess }) => {
  const dispatch = useDispatch();
  const productos = useSelector((state) => state.productos.productos);
  const { updateAfterProductoMovement } = useGlobalUpdate();
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    fecha: '',
    descripcion: '',
    productos: [{ productoId: '', cantidad: '', fechaVencimiento: '' }]
  });
  
  // Estados de error
  const [error, setError] = useState(false);
  const [textoError, setTextoError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const wasOpenRef = useRef(false);

  // Cargar productos y datos del movimiento cuando se abre el modal
  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      // Cargar productos si están vacíos
      if (!productos || productos.length === 0) {
        dispatch(loadProductos());
      }

      // Cargar datos del movimiento
      if (movimiento) {
        // ✅ CORREGIDO: Formatear fecha usando hora local para evitar problemas de zona horaria
        let fechaFormateada = '';
        if (movimiento.fecha) {
          fechaFormateada = formatDateToLocalString(movimiento.fecha);
        }

        // Convertir detalles a formato del formulario
        // ✅ CRÍTICO: Consolidar detalles del mismo producto (sumar cantidades)
        const detallesMap = new Map();
        
        (movimiento.detalles || []).forEach(detalle => {
          const productoId = String(detalle.id || detalle.productoId || detalle.producto?.id || '');
          
          if (productoId && productoId !== 'undefined' && productoId !== '') {
            if (detallesMap.has(productoId)) {
              // Si ya existe, sumar la cantidad
              const existente = detallesMap.get(productoId);
              existente.cantidad = (existente.cantidad || 0) + (detalle.cantidad || 0);
            } else {
              // Si no existe, crear nuevo
              detallesMap.set(productoId, {
                productoId: productoId,
                cantidad: detalle.cantidad || 0,
                fechaVencimiento: detalle.fechaVencimiento 
                  ? formatDateToLocalString(detalle.fechaVencimiento)
                  : ''
              });
            }
          }
        });
        
        const productosFormateados = Array.from(detallesMap.values());

        setFormData({
          fecha: fechaFormateada,
          descripcion: movimiento.descripcion || '',
          productos: productosFormateados.length > 0 ? productosFormateados : [{ productoId: '', cantidad: '', fechaVencimiento: '' }]
        });
      }

      setError(false);
      setTextoError('');
    }

    wasOpenRef.current = isOpen;
  }, [isOpen, movimiento, productos, dispatch]);

  // Limpiar errores cuando el usuario cambia los inputs
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) {
      setError(false);
      setTextoError('');
    }
  };

  const handleProductoChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      productos: prev.productos.map((producto, i) => 
        i === index ? { ...producto, [field]: value } : producto
      )
    }));
    
    if (error) {
      setError(false);
      setTextoError('');
    }
  };

  const addProducto = () => {
    setFormData(prev => ({
      ...prev,
      productos: [...prev.productos, { productoId: '', cantidad: '', fechaVencimiento: '' }]
    }));
  };

  const removeProducto = (index) => {
    if (formData.productos.length > 1) {
      setFormData(prev => ({
        ...prev,
        productos: prev.productos.filter((_, i) => i !== index)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(false);
    setTextoError('');
    setIsSubmitting(true);

    // Validaciones básicas
    if (!formData.fecha) {
      setError(true);
      setTextoError('La fecha es obligatoria');
      setIsSubmitting(false);
      return;
    }

    if (formData.productos.length === 0) {
      setError(true);
      setTextoError('Debe agregar al menos un producto');
      setIsSubmitting(false);
      return;
    }

    // Validar que todos los productos tengan datos válidos
    for (const producto of formData.productos) {
      if (!producto.productoId || !producto.cantidad || parseFloat(producto.cantidad) <= 0) {
        setError(true);
        setTextoError('Todos los productos deben tener cantidad válida y estar seleccionados');
        setIsSubmitting(false);
        return;
      }
    }

    // Validar productos duplicados
    const productoIds = formData.productos.map(p => p.productoId);
    if (new Set(productoIds).size !== productoIds.length) {
      setError(true);
      setTextoError('No puede seleccionar el mismo producto más de una vez');
      setIsSubmitting(false);
      return;
    }

    // Validaciones para ENTRADA (producción)
    for (const producto of formData.productos) {
      if (!producto.fechaVencimiento) {
        setError(true);
        setTextoError('Para movimientos de entrada, la fecha de vencimiento es obligatoria');
        setIsSubmitting(false);
        return;
      }
      
      // Validar fecha de vencimiento futura
      const fechaVencimiento = new Date(producto.fechaVencimiento);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      
      if (fechaVencimiento < hoy) {
        setError(true);
        setTextoError('La fecha de vencimiento debe ser futura');
        setIsSubmitting(false);
        return;
      }
    }

    // Validar que la fecha no sea muy antigua
    const fechaMovimiento = new Date(formData.fecha);
    const fechaLimite = new Date();
    fechaLimite.setFullYear(fechaLimite.getFullYear() - 1);
    
    if (fechaMovimiento < fechaLimite) {
      setError(true);
      setTextoError('La fecha no puede ser anterior a hace un año');
      setIsSubmitting(false);
      return;
    }

    // Preparar datos para enviar
    const movimientoData = {
      fecha: formData.fecha,
      descripcion: formData.descripcion.trim(),
      tipoMovimiento: 'ENTRADA', // Solo se pueden editar movimientos de entrada
      detalles: formData.productos.map(producto => ({
        id: producto.productoId,
        cantidad: parseFloat(producto.cantidad),
        precioVenta: 0,
        fechaVencimiento: producto.fechaVencimiento
      }))
    };

    try {
      const result = await dispatch(updateMovimientoProducto({ 
        id: movimiento.id, 
        data: movimientoData 
      })).unwrap();
      
      console.log('✅ Movimiento editado exitosamente:', result);
      
      // Actualizar datos globalmente después del éxito
      await updateAfterProductoMovement();
      
      // Limpiar formulario
      setFormData({
        fecha: '',
        descripcion: '',
        productos: [{ productoId: '', cantidad: '', fechaVencimiento: '' }]
      });
      setError(false);
      setTextoError('');
      
      if (onSuccess) {
        onSuccess();
      }
      
      onClose();
    } catch (err) {
      console.log('🔥 EditarMovimientoProductoModal - CATCH ERROR:', err);
      console.log('🔥 Error type:', typeof err);
      console.log('🔥 Error object:', JSON.stringify(err, null, 2));
      
      // Determinar el mensaje de error
      // Redux Toolkit devuelve el error directamente como string cuando se usa rejectWithValue
      let errorMsg = 'Error inesperado al editar el movimiento de producto';
      if (typeof err === 'string') {
        console.log('✅ Setting error from string:', err);
        errorMsg = err;
      } else if (err?.payload) {
        // Redux Toolkit puede devolver el error en payload
        console.log('✅ Setting error from payload:', err.payload);
        errorMsg = typeof err.payload === 'string' ? err.payload : err.payload?.error || err.payload?.message || errorMsg;
      } else if (err.response?.data?.error) {
        console.log('✅ Setting error from response.data.error:', err.response.data.error);
        errorMsg = err.response.data.error;
      } else if (err.message) {
        console.log('✅ Setting error from message:', err.message);
        errorMsg = err.message;
      }
      
      // Formatear el mensaje de error para mejor legibilidad
      errorMsg = errorMsg
        .replace(/\. /g, '.\n')
        .replace(/, /g, ',\n')
        .trim();
      
      // ✅ Setear ambos estados juntos
      setError(true);
      setTextoError(errorMsg);
      setIsSubmitting(false);
      
      console.log('🔥 Estados seteados:', { error: true, textoError: errorMsg, isSubmitting: false });
      console.log('🔥 Modal should stay OPEN - NOT closing');
      
      // ⚠️ IMPORTANTE: NO cerrar el modal cuando hay error
      return;
    } finally {
      console.log('🔄 Finally block - already set isSubmitting to false in catch');
    }
  };

  const handleClose = () => {
    setFormData({
      fecha: '',
      descripcion: '',
      productos: [{ productoId: '', cantidad: '', fechaVencimiento: '' }]
    });
    setError(false);
    setTextoError('');
    setIsSubmitting(false);
    onClose();
  };

  // Solo permitir editar movimientos de ENTRADA
  if (movimiento && movimiento.tipoMovimiento !== 'ENTRADA') {
    return (
      <FormModal
        isOpen={isOpen}
        onClose={handleClose}
        title="Editar Movimiento de Producto"
        maxWidth="max-w-4xl"
      >
        <div className="p-6 text-center">
          <p className="text-red-600 font-medium">
            Solo se pueden editar movimientos de entrada (producción)
          </p>
        </div>
      </FormModal>
    );
  }

  return (
    <FormModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Editar Movimiento de Producto"
      onSubmit={handleSubmit}
      submitText="Guardar cambios"
      isSubmitting={isSubmitting}
      error={error}
      errorMessage={textoError}
      maxWidth="max-w-4xl"
      closeOnBackdropClick={!error}
    >
      {/* Header con información del movimiento */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Fecha */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-blue-700 font-medium text-sm">
              <FaCalendarAlt className="text-blue-600" />
              Fecha
            </label>
            <input
              type="date"
              value={formData.fecha}
              onChange={(e) => handleInputChange('fecha', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 bg-white"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Tipo de movimiento (solo lectura) */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-blue-700 font-medium text-sm">
              <FaTag className="text-blue-600" />
              Tipo de movimiento
            </label>
            <input
              type="text"
              value="Entrada (Producción)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
              disabled
              readOnly
            />
          </div>
        </div>
      </div>

      {/* Descripción */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Descripción
        </label>
        <Input
          type="text"
          value={formData.descripcion}
          onChange={(e) => handleInputChange('descripcion', e.target.value)}
          placeholder="Descripción del movimiento"
          disabled={isSubmitting}
        />
      </div>

      {/* Lista de productos */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <FaBox className="text-blue-600" />
            Productos
          </h3>
          <Button
            type="button"
            onClick={addProducto}
            variant="outline"
            size="sm"
            disabled={isSubmitting}
          >
            <FaPlus className="mr-1" size={12} />
            Agregar Producto
          </Button>
        </div>

        <div className="space-y-4">
          {formData.productos.map((producto, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Producto */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Producto *
                  </label>
                  <select
                    value={producto.productoId}
                    onChange={(e) => handleProductoChange(index, 'productoId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 bg-white"
                    required
                    disabled={isSubmitting}
                  >
                    <option value="">Seleccionar producto</option>
                    {productos && productos.map((prod) => (
                      <option key={prod.id} value={prod.id}>
                        {prod.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Cantidad */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cantidad *
                  </label>
                  <NumberInput
                    value={producto.cantidad}
                    onChange={(value) => handleProductoChange(index, 'cantidad', value)}
                    placeholder="0"
                    min="0"
                    step="0.01"
                    disabled={isSubmitting}
                    required
                  />
                </div>

                {/* Fecha de vencimiento */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha Vencimiento *
                  </label>
                  <input
                    type="date"
                    value={producto.fechaVencimiento}
                    onChange={(e) => handleProductoChange(index, 'fechaVencimiento', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 bg-white"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                {/* Botón eliminar */}
                <div className="flex items-end">
                  <Button
                    type="button"
                    onClick={() => removeProducto(index)}
                    variant="outline"
                    size="sm"
                    disabled={isSubmitting || formData.productos.length === 1}
                    className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <FaTrash className="mr-1" size={12} />
                    Eliminar
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </FormModal>
  );
};

export default EditarMovimientoProductoModal;


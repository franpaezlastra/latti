import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaBox, FaCalendarAlt, FaTag, FaDollarSign } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { createMovimientoProducto, createVentaPorLotes } from '../../../../store/actions/movimientoProductoActions';
import { loadProductos, loadStockPorLotes } from '../../../../store/actions/productosActions';
import { useGlobalUpdate } from '../../../../hooks/useGlobalUpdate';
import FormModal from '../../../ui/FormModal';
import Button from '../../../ui/Button';
import Input from '../../../ui/Input';
import NumberInput from '../../../ui/NumberInput';

const MovimientoProductoModal = ({ isOpen, onClose, onSubmit }) => {
  const dispatch = useDispatch();
  const productos = useSelector((state) => state.productos.productos);
  const stockPorLotes = useSelector((state) => state.productos.stockPorLotes);
  const { updateAfterProductoMovement } = useGlobalUpdate();
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    tipoMovimiento: '',
    fecha: '',
    descripcion: '',
    productos: [{ productoId: '', cantidad: '', precioVenta: '', fechaVencimiento: '' }]
  });
  
  // Estados para lotes
  const [productoLotes, setProductoLotes] = useState({});
  const [usarLotes, setUsarLotes] = useState(false);
  
  // Estados de error
  const [error, setError] = useState(false);
  const [textoError, setTextoError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Limpiar formulario cuando se abre/cierra el modal
  useEffect(() => {
    if (isOpen) {
      // Cargar productos si están vacíos
      if (!productos || productos.length === 0) {
        dispatch(loadProductos());
      }
      
      setFormData({
        tipoMovimiento: '',
        fecha: '',
        descripcion: '',
        productos: [{ productoId: '', cantidad: '', precioVenta: '', fechaVencimiento: '' }]
      });
      setProductoLotes({});
      setUsarLotes(false);
      setError(false);
      setTextoError('');
    }
  }, [isOpen, dispatch]);

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
    
    // Si se seleccionó un producto y es movimiento de salida, cargar lotes
    if (field === 'productoId' && value && formData.tipoMovimiento === 'SALIDA') {
      dispatch(loadStockPorLotes(value));
      
      // Si se están usando lotes, calcular la cantidad total
      if (usarLotes) {
        setTimeout(() => {
          const cantidadTotal = calcularCantidadTotalLotes(index);
          handleProductoChange(index, 'cantidad', cantidadTotal.toString());
        }, 100); // Pequeño delay para asegurar que los lotes se carguen
      }
    }
    
    if (error) {
      setError(false);
      setTextoError('');
    }
  };

  const addProducto = () => {
    setFormData(prev => ({
      ...prev,
      productos: [...prev.productos, { productoId: '', cantidad: '', precioVenta: '', fechaVencimiento: '' }]
    }));
    if (error) {
      setError(false);
      setTextoError('');
    }
  };

  const removeProducto = (index) => {
    if (formData.productos.length === 1) return;
    setFormData(prev => ({
      ...prev,
      productos: prev.productos.filter((_, i) => i !== index)
    }));
    if (error) {
      setError(false);
      setTextoError('');
    }
  };

  const handleLoteChange = (productoIndex, lote, cantidad) => {
    setProductoLotes(prev => ({
      ...prev,
      [productoIndex]: {
        ...prev[productoIndex],
        [lote]: parseFloat(cantidad) || 0
      }
    }));

    // Calcular la cantidad total basada en los lotes seleccionados
    const lotesActualizados = {
      ...productoLotes[productoIndex],
      [lote]: parseFloat(cantidad) || 0
    };
    
    const cantidadTotal = Object.values(lotesActualizados).reduce((sum, cant) => sum + cant, 0);
    
    // Actualizar la cantidad del producto automáticamente
    handleProductoChange(productoIndex, 'cantidad', cantidadTotal.toString());
  };

  // Función para calcular la cantidad total de lotes para un producto
  const calcularCantidadTotalLotes = (productoIndex) => {
    const lotesProducto = productoLotes[productoIndex] || {};
    return Object.values(lotesProducto).reduce((sum, cantidad) => sum + cantidad, 0);
  };

  // Función para actualizar la cantidad cuando se cambia el checkbox de usar lotes
  const handleUsarLotesChange = (checked) => {
    setUsarLotes(checked);
    
    // Si se deshabilita usar lotes, limpiar las cantidades de lotes
    if (!checked) {
      setProductoLotes({});
    } else {
      // Si se habilita usar lotes, calcular la cantidad total para cada producto
      formData.productos.forEach((producto, index) => {
        if (producto.productoId) {
          const cantidadTotal = calcularCantidadTotalLotes(index);
          handleProductoChange(index, 'cantidad', cantidadTotal.toString());
        }
      });
    }
  };

  const getLotesDisponibles = (productoId) => {
    if (!productoId || !stockPorLotes || stockPorLotes.length === 0) return [];
    
    // Filtrar lotes por fecha si es una salida
    if (formData.tipoMovimiento === 'SALIDA' && formData.fecha) {
      const fechaMovimiento = new Date(formData.fecha);
      return stockPorLotes.filter(lote => {
        // Solo mostrar lotes creados antes o en la fecha del movimiento
        const fechaLote = new Date(lote.fechaCreacion || '2025-01-01'); // Fecha por defecto si no hay
        return lote.cantidadDisponible > 0 && fechaLote <= fechaMovimiento;
      });
    }
    
    return stockPorLotes.filter(lote => lote.cantidadDisponible > 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(false);
    setTextoError('');
    setIsSubmitting(true);

    // Validaciones básicas
    if (!formData.tipoMovimiento.trim()) {
      setError(true);
      setTextoError('El tipo de movimiento es obligatorio');
      setIsSubmitting(false);
      return;
    }

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

    // Validaciones específicas según el tipo de movimiento
    if (formData.tipoMovimiento === "ENTRADA") {
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
    }

    if (formData.tipoMovimiento === "SALIDA") {
      for (const producto of formData.productos) {
        if (!producto.precioVenta || parseFloat(producto.precioVenta) <= 0) {
          setError(true);
          setTextoError('Para movimientos de salida, el precio de venta es obligatorio');
          setIsSubmitting(false);
          return;
        }
      }
    }

    // Si es salida y se está usando lotes, crear venta por lotes
    if (formData.tipoMovimiento === "SALIDA" && usarLotes) {
      const ventasPorLotes = [];
      
      for (let i = 0; i < formData.productos.length; i++) {
        const producto = formData.productos[i];
        const lotesProducto = productoLotes[i] || {};
        
        // Verificar que se haya seleccionado al menos un lote
        const lotesSeleccionados = Object.values(lotesProducto).filter(cantidad => cantidad > 0);
        if (lotesSeleccionados.length === 0) {
          setError(true);
          setTextoError(`Debe seleccionar al menos un lote para el producto ${productos.find(p => p.id === producto.productoId)?.nombre || 'seleccionado'}`);
          setIsSubmitting(false);
          return;
        }
        
        // Verificar que la suma de lotes coincida con la cantidad total
        const sumaLotes = Object.values(lotesProducto).reduce((sum, cantidad) => sum + cantidad, 0);
        if (Math.abs(sumaLotes - parseFloat(producto.cantidad)) > 0.01) {
          setError(true);
          setTextoError(`La suma de lotes debe coincidir con la cantidad total para el producto ${productos.find(p => p.id === producto.productoId)?.nombre || 'seleccionado'}`);
          setIsSubmitting(false);
          return;
        }
        
        // Agregar cada lote como una venta separada
        Object.entries(lotesProducto).forEach(([lote, cantidad]) => {
          if (cantidad > 0) {
            ventasPorLotes.push({
              productoId: producto.productoId,
              lote: lote,
              cantidad: cantidad,
              precioVenta: parseFloat(producto.precioVenta)
            });
          }
        });
      }
      
      const ventaPorLotesData = {
        fecha: formData.fecha,
        descripcion: formData.descripcion.trim(),
        ventasPorLotes: ventasPorLotes
      };
      
      try {
        const result = await dispatch(createVentaPorLotes(ventaPorLotesData)).unwrap();
        
        // Actualizar datos globalmente después del éxito
        await updateAfterProductoMovement();
        
        // Limpiar formulario
        setFormData({
          tipoMovimiento: '',
          fecha: '',
          descripcion: '',
          productos: [{ productoId: '', cantidad: '', precioVenta: '', fechaVencimiento: '' }]
        });
        setProductoLotes({});
        setUsarLotes(false);
        setError(false);
        setTextoError('');
        
        if (onSubmit) onSubmit();
      } catch (err) {
        console.log('MovimientoProductoModal - catch error (venta por lotes):', err);
        setError(true);
        
        if (typeof err === 'string') {
          setTextoError(err);
        } else if (err.response?.data?.error) {
          setTextoError(err.response.data.error);
        } else if (err.message) {
          setTextoError(err.message);
        } else {
          setTextoError('Error inesperado al registrar la venta por lotes');
        }
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // Movimiento normal (sin lotes)
    const movimientoData = {
      fecha: formData.fecha,
      descripcion: formData.descripcion.trim(),
      tipoMovimiento: formData.tipoMovimiento,
      detalles: formData.productos.map(producto => ({
        id: producto.productoId,
        cantidad: parseFloat(producto.cantidad),
        precioVenta: formData.tipoMovimiento === "SALIDA" ? parseFloat(producto.precioVenta) : 0,
        fechaVencimiento: formData.tipoMovimiento === "ENTRADA" ? producto.fechaVencimiento : null
      }))
    };

    try {
      const result = await dispatch(createMovimientoProducto(movimientoData)).unwrap();
      
      // Actualizar datos globalmente después del éxito
      await updateAfterProductoMovement();
      
      // Limpiar formulario
      setFormData({
        tipoMovimiento: '',
        fecha: '',
        descripcion: '',
        productos: [{ productoId: '', cantidad: '', precioVenta: '', fechaVencimiento: '' }]
      });
      setError(false);
      setTextoError('');
      
      if (onSubmit) onSubmit();
    } catch (err) {
      console.log('MovimientoProductoModal - catch error:', err);
      setError(true);
      
      // Si err es directamente el string del error (viene de rejectWithValue)
      if (typeof err === 'string') {
        console.log('MovimientoProductoModal - setting error from string:', err);
        setTextoError(err);
      } else if (err.response?.data?.error) {
        console.log('MovimientoProductoModal - setting error from response:', err.response.data.error);
        setTextoError(err.response.data.error);
      } else if (err.message) {
        console.log('MovimientoProductoModal - setting error from message:', err.message);
        setTextoError(err.message);
      } else {
        console.log('MovimientoProductoModal - setting generic error');
        setTextoError('Error inesperado al registrar el movimiento de producto');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      tipoMovimiento: '',
      fecha: '',
      descripcion: '',
      productos: [{ productoId: '', cantidad: '', precioVenta: '', fechaVencimiento: '' }]
    });
    setProductoLotes({});
    setUsarLotes(false);
    setError(false);
    setTextoError('');
    setIsSubmitting(false);
    onClose();
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Agregar Movimiento de Producto"
      onSubmit={handleSubmit}
      submitText="Confirmar movimiento"
      isSubmitting={isSubmitting}
      error={error}
      errorMessage={textoError}
      maxWidth="max-w-4xl"
    >
      {/* Header con información del movimiento */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Tipo de movimiento */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-blue-700 font-medium text-sm">
              <FaTag className="text-blue-600" />
              Tipo de movimiento
            </label>
            <select
              value={formData.tipoMovimiento}
              onChange={(e) => handleInputChange('tipoMovimiento', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 bg-white"
              required
              disabled={isSubmitting}
            >
              <option value="">Seleccione</option>
              <option value="ENTRADA">Entrada</option>
              <option value="SALIDA">Salida</option>
            </select>
          </div>

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

          {/* Descripción */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-blue-700 font-medium text-sm">
              <FaDollarSign className="text-blue-600" />
              Descripción
            </label>
            <input
              type="text"
              placeholder="Ej: Producción semanal"
              value={formData.descripcion}
              onChange={(e) => handleInputChange('descripcion', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 bg-white"
              disabled={isSubmitting}
            />
          </div>
        </div>
      </div>

      {/* Opción de usar lotes (solo para salidas) */}
      {formData.tipoMovimiento === "SALIDA" && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 mb-6 border border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={usarLotes}
                onChange={(e) => handleUsarLotesChange(e.target.checked)}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500 w-4 h-4"
                disabled={isSubmitting}
              />
              <div className="flex items-center gap-2">
                <FaBox className="text-green-600 text-lg" />
                <span className="text-green-800 font-medium">Usar lotes específicos</span>
              </div>
            </div>
            <div className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded-full">
              Opcional
            </div>
          </div>
          <p className="text-sm text-green-700 mt-2 ml-7">
            Permite seleccionar cantidades específicas de cada lote disponible
          </p>
        </div>
      )}

      {/* Sección de productos */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FaBox className="text-blue-600" />
            Detalle de Productos
          </h3>
          <Button
            type="button"
            onClick={addProducto}
            variant="outline"
            size="small"
            className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700"
            disabled={isSubmitting}
          >
            <FaPlus size={12} />
            Agregar Producto
          </Button>
        </div>

        {formData.productos.length === 0 ? (
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
            <FaBox className="text-4xl text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-medium">No hay productos agregados</p>
            <p className="text-xs mt-1">Haz clic en "Agregar Producto" para comenzar</p>
          </div>
        ) : (
          <div className="space-y-4">
            {formData.productos.map((producto, index) => (
              <div key={index} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Producto */}
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-600 block">
                        Producto *
                      </label>
                      <select
                        value={producto.productoId}
                        onChange={(e) => handleProductoChange(index, 'productoId', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                        required
                        disabled={isSubmitting}
                      >
                        <option value="">Seleccionar producto</option>
                        {productos.map((p) => {
                          // Verificar si este producto está seleccionado en otra fila
                          const productosSeleccionados = formData.productos
                            .map((item, idx) => ({ id: String(item.productoId), index: idx }))
                            .filter(item => item.id && item.id !== 'undefined' && item.index !== index);
                          
                          const productoIdsSeleccionados = productosSeleccionados.map(item => item.id);
                          const estaSeleccionadoEnOtra = productoIdsSeleccionados.includes(String(p.id));
                          const esSeleccionActual = String(producto.productoId) === String(p.id);
                          
                          return (
                            <option 
                              key={p.id} 
                              value={p.id}
                              disabled={estaSeleccionadoEnOtra && !esSeleccionActual}
                              style={{
                                color: estaSeleccionadoEnOtra && !esSeleccionActual ? '#999' : 'inherit',
                                fontStyle: estaSeleccionadoEnOtra && !esSeleccionActual ? 'italic' : 'normal'
                              }}
                            >
                              {p.nombre} {formData.tipoMovimiento === "SALIDA" ? `(Stock: ${p.stockActual})` : ""} {estaSeleccionadoEnOtra && !esSeleccionActual ? '(ya seleccionado)' : ''}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    {/* Cantidad */}
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-600 block">
                        Cantidad *
                        {formData.tipoMovimiento === "SALIDA" && usarLotes && (
                          <span className="text-green-600 ml-1">(automáticamente)</span>
                        )}
                      </label>
                      <NumberInput
                        placeholder="0,00"
                        value={producto.cantidad}
                        onChange={(value) => handleProductoChange(index, 'cantidad', value)}
                        required
                        disabled={isSubmitting || (formData.tipoMovimiento === "SALIDA" && usarLotes)}
                        className={`w-full px-3 py-2 text-sm ${formData.tipoMovimiento === "SALIDA" && usarLotes ? 'bg-gray-100' : ''}`}
                      />
                    </div>

                    {/* Fecha de Vencimiento (solo para ENTRADA) */}
                    {formData.tipoMovimiento === "ENTRADA" && (
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-600 block">
                          Fecha de Vencimiento *
                        </label>
                        <input
                          type="date"
                          value={producto.fechaVencimiento || ""}
                          onChange={(e) => handleProductoChange(index, 'fechaVencimiento', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                          required
                          disabled={isSubmitting}
                        />
                      </div>
                    )}

                    {/* Precio de Venta (solo para SALIDA) */}
                    {formData.tipoMovimiento === "SALIDA" && (
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-600 block">
                          Precio de Venta por Unidad *
                          <span className="text-blue-600 ml-1">(se multiplicará por la cantidad)</span>
                        </label>
                        <NumberInput
                          placeholder="0,00"
                          value={producto.precioVenta}
                          onChange={(value) => handleProductoChange(index, 'precioVenta', value)}
                          required
                          disabled={isSubmitting}
                          className="w-full px-3 py-2 text-sm"
                        />
                        <p className="text-xs text-gray-500">
                          Ej: $10,00 por kg, $5,00 por unidad
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {/* Botón eliminar */}
                  <button
                    type="button"
                    onClick={() => removeProducto(index)}
                    className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50 ml-4 flex-shrink-0"
                    disabled={isSubmitting || formData.productos.length === 1}
                  >
                    <FaTrash size={14} />
                  </button>
                </div>
                
                {/* Sección de lotes (solo para salidas con lotes habilitados) */}
                {formData.tipoMovimiento === "SALIDA" && usarLotes && producto.productoId && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 mb-3">
                      <FaBox className="text-green-600 text-sm" />
                      <span className="text-sm font-medium text-gray-700">Lotes disponibles</span>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {getLotesDisponibles(producto.productoId).length} disponibles
                      </span>
                    </div>
                    
                    {getLotesDisponibles(producto.productoId).length === 0 ? (
                      <div className="text-sm text-gray-500 italic bg-gray-50 p-3 rounded-lg">
                        No hay lotes disponibles para este producto
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {getLotesDisponibles(producto.productoId).map((lote) => (
                          <div key={lote.lote} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-700">
                                Lote: {lote.lote}
                              </div>
                              <div className="text-xs text-gray-500">
                                Disponible: {lote.cantidadDisponible}
                                {lote.fechaVencimiento && (
                                  <span className="ml-2">
                                    | Vence: {new Date(lote.fechaVencimiento).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                            <NumberInput
                              placeholder="0"
                              value={productoLotes[index]?.[lote.lote] || ''}
                              onChange={(value) => handleLoteChange(index, lote.lote, value)}
                              disabled={isSubmitting}
                              className="w-24 px-2 py-1 text-xs"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Resumen de lotes */}
                    {Object.keys(productoLotes[index] || {}).length > 0 && (
                      <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="text-xs font-medium text-green-800 mb-2 flex items-center gap-2">
                          <FaBox className="text-green-600" />
                          Resumen de lotes seleccionados:
                        </div>
                        <div className="space-y-1">
                          {Object.entries(productoLotes[index] || {}).map(([lote, cantidad]) => (
                            cantidad > 0 && (
                              <div key={lote} className="flex justify-between text-xs">
                                <span className="text-green-700">{lote}:</span>
                                <span className="font-medium">{cantidad}</span>
                              </div>
                            )
                          ))}
                          <div className="border-t border-green-200 pt-1 mt-1">
                            <div className="flex justify-between font-medium text-xs">
                              <span className="text-green-800">Total calculado:</span>
                              <span className="text-green-800 font-bold">
                                {Object.values(productoLotes[index] || {}).reduce((sum, cantidad) => sum + cantidad, 0)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </FormModal>
  );
};

export default MovimientoProductoModal; 
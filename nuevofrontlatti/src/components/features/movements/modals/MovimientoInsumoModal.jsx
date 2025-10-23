import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaCalendarAlt, FaTag, FaDollarSign, FaBox, FaCog, FaInfoCircle } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { createMovimientoInsumo } from '../../../../store/actions/movimientoInsumoActions';
import { fetchInsumos } from '../../../../store/slices/insumoSlice';
import { useGlobalUpdate } from '../../../../hooks/useGlobalUpdate';
import FormModal from '../../../ui/FormModal';
import Button from '../../../ui/Button';
import Input from '../../../ui/Input';
import NumberInput from '../../../ui/NumberInput';

const MovimientoInsumoModal = ({ isOpen, onClose, onSubmit }) => {
  const dispatch = useDispatch();
  const { insumos, loading, error } = useSelector((state) => state.insumos);
  const { updateAfterInsumoMovement } = useGlobalUpdate();
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    tipoMovimiento: '',
    fecha: '',
    descripcion: '',
    insumos: [{ insumoId: '', cantidad: '', precioDeCompra: '' }]
  });
  
  // Estados de error
  const [error, setError] = useState(false);
  const [textoError, setTextoError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Limpiar formulario cuando se abre/cierra el modal
  useEffect(() => {
    if (isOpen) {
      console.log("🔄 Abriendo modal de movimiento de insumos");
      console.log("📊 Estado actual de insumos:", { insumos, loading, error });
      
      // Cargar insumos siempre para asegurar datos actualizados
      dispatch(fetchInsumos());
      
      setFormData({
        tipoMovimiento: '',
        fecha: '',
        descripcion: '',
        insumos: [{ insumoId: '', cantidad: '', precioDeCompra: '' }]
      });
      setError(false);
      setTextoError('');
    }
  }, [isOpen, dispatch]);

  // Debug: Log cuando cambie el estado de insumos
  useEffect(() => {
    console.log("📊 Estado de insumos actualizado:", { insumos, loading, error });
    if (insumos && insumos.length > 0) {
      console.log("✅ Insumos disponibles:", insumos);
    } else if (!loading && !error) {
      console.log("⚠️ No hay insumos disponibles");
    } else if (error) {
      console.log("❌ Error cargando insumos:", error);
    }
  }, [insumos, loading, error]);

  // Limpiar errores cuando el usuario cambia los inputs
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) {
      setError(false);
      setTextoError('');
    }
  };

  const handleInsumoChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      insumos: prev.insumos.map((insumo, i) => 
        i === index ? { ...insumo, [field]: value } : insumo
      )
    }));
    if (error) {
      setError(false);
      setTextoError('');
    }
  };

  const addInsumo = () => {
    setFormData(prev => ({
      ...prev,
      insumos: [...prev.insumos, { insumoId: '', cantidad: '', precioDeCompra: '' }]
    }));
    if (error) {
      setError(false);
      setTextoError('');
    }
  };

  const removeInsumo = (index) => {
    if (formData.insumos.length === 1) return;
    setFormData(prev => ({
      ...prev,
      insumos: prev.insumos.filter((_, i) => i !== index)
    }));
    if (error) {
      setError(false);
      setTextoError('');
    }
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

    if (formData.insumos.length === 0) {
      setError(true);
      setTextoError('Debe agregar al menos un insumo');
      setIsSubmitting(false);
      return;
    }

    // Validar que todos los insumos tengan datos válidos
    for (const insumo of formData.insumos) {
      if (!insumo.insumoId || !insumo.cantidad || parseFloat(insumo.cantidad) <= 0) {
        setError(true);
        setTextoError('Todos los insumos deben tener cantidad válida y estar seleccionados');
        setIsSubmitting(false);
        return;
      }
    }

    // Validar insumos duplicados
    const insumoIds = formData.insumos.map(i => i.insumoId);
    if (new Set(insumoIds).size !== insumoIds.length) {
      setError(true);
      setTextoError('No puede seleccionar el mismo insumo más de una vez');
      setIsSubmitting(false);
      return;
    }

    // Validaciones específicas según el tipo de movimiento
    if (formData.tipoMovimiento === "ENTRADA") {
      for (const insumo of formData.insumos) {
        if (!insumo.precioDeCompra || parseFloat(insumo.precioDeCompra) <= 0) {
          setError(true);
          setTextoError('Para movimientos de entrada, el precio de compra es obligatorio');
          setIsSubmitting(false);
          return;
        }
      }
    }

    // Crear el movimiento
    const movimientoData = {
      fecha: formData.fecha,
      descripcion: formData.descripcion.trim(),
      tipoMovimiento: formData.tipoMovimiento,
      detalles: formData.insumos.map(insumo => ({
        insumoId: insumo.insumoId,
        cantidad: parseFloat(insumo.cantidad),
        precio: formData.tipoMovimiento === "ENTRADA" ? parseFloat(insumo.precioDeCompra) : 0
      }))
    };

    try {
      const result = await dispatch(createMovimientoInsumo(movimientoData)).unwrap();
      
      // Actualizar datos globalmente después del éxito
      await updateAfterInsumoMovement();
      
      // Limpiar formulario
      setFormData({
        tipoMovimiento: '',
        fecha: '',
        descripcion: '',
        insumos: [{ insumoId: '', cantidad: '', precioDeCompra: '' }]
      });
      setError(false);
      setTextoError('');
      
      if (onSubmit) onSubmit();
    } catch (err) {
      console.log('MovimientoInsumoModal - catch error:', err);
      setError(true);
      
      // Si err es directamente el string del error (viene de rejectWithValue)
      if (typeof err === 'string') {
        console.log('MovimientoInsumoModal - setting error from string:', err);
        setTextoError(err);
      } else if (err.response?.data?.error) {
        console.log('MovimientoInsumoModal - setting error from response:', err.response.data.error);
        setTextoError(err.response.data.error);
      } else if (err.message) {
        console.log('MovimientoInsumoModal - setting error from message:', err.message);
        setTextoError(err.message);
      } else {
        console.log('MovimientoInsumoModal - setting generic error');
        setTextoError('Error inesperado al registrar el movimiento de insumo');
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
      insumos: [{ insumoId: '', cantidad: '', precioDeCompra: '' }]
    });
    setError(false);
    setTextoError('');
    setIsSubmitting(false);
    onClose();
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Agregar Movimiento de Insumo"
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
              placeholder="Ej: Compra de materias primas"
              value={formData.descripcion}
              onChange={(e) => handleInputChange('descripcion', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 bg-white"
              disabled={isSubmitting}
            />
          </div>
        </div>
      </div>

      {/* Información adicional para entradas */}
      {formData.tipoMovimiento === "ENTRADA" && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 mb-6 border border-green-200">
          <div className="flex items-center gap-3">
            <FaDollarSign className="text-green-600 text-lg" />
            <div>
              <h4 className="text-green-800 font-medium">Movimiento de Entrada</h4>
              <p className="text-sm text-green-700">
                Ingresa el <strong>precio total</strong> que pagaste por toda la cantidad. 
                El sistema calculará automáticamente el precio por unidad.
              </p>
              <p className="text-xs text-green-600 mt-1">
                💡 Ejemplo: Si compraste 10 kg de harina por $80, ingresa $80 (no $8 por kg)
              </p>
              <div className="mt-2 p-2 bg-green-100 rounded border border-green-300">
                <div className="flex items-start gap-2">
                  <FaInfoCircle className="text-green-700 mt-0.5" size={12} />
                  <div className="text-xs text-green-800">
                    <p className="font-medium">Insumos Compuestos:</p>
                    <p>Para insumos compuestos, este movimiento solo registra el stock. 
                    Para ensamblar, usa la opción "Ensamblar" en la lista de insumos.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Información adicional para salidas */}
      {formData.tipoMovimiento === "SALIDA" && (
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg p-4 mb-6 border border-orange-200">
          <div className="flex items-center gap-3">
            <FaBox className="text-orange-600 text-lg" />
            <div>
              <h4 className="text-orange-800 font-medium">Movimiento de Salida</h4>
              <p className="text-sm text-orange-700">
                Se descontará del stock disponible del insumo
              </p>
              <div className="mt-2 p-2 bg-orange-100 rounded border border-orange-300">
                <div className="flex items-start gap-2">
                  <FaInfoCircle className="text-orange-700 mt-0.5" size={12} />
                  <div className="text-xs text-orange-800">
                    <p className="font-medium">Insumos Compuestos:</p>
                    <p>Para insumos compuestos, esto descuenta el insumo compuesto directamente, 
                    NO sus componentes individuales.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sección de insumos */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FaBox className="text-blue-600" />
            Detalle de Insumos
          </h3>
          <Button
            type="button"
            onClick={addInsumo}
            variant="outline"
            size="small"
            className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700"
            disabled={isSubmitting}
          >
            <FaPlus size={12} />
            Agregar Insumo
          </Button>
        </div>

        {formData.insumos.length === 0 ? (
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
            <FaBox className="text-4xl text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-medium">No hay insumos agregados</p>
            <p className="text-xs mt-1">Haz clic en "Agregar Insumo" para comenzar</p>
          </div>
        ) : (
          <div className="space-y-4">
            {formData.insumos.map((insumo, index) => (
              <div key={index} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Insumo */}
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-600 block">
                        Insumo *
                      </label>
                      <select
                        value={insumo.insumoId}
                        onChange={(e) => handleInsumoChange(index, 'insumoId', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                        required
                        disabled={isSubmitting || loading}
                      >
                        <option value="">
                          {loading ? 'Cargando insumos...' : 'Seleccionar insumo'}
                        </option>
                        {!loading && !error && insumos && insumos.length > 0 ? insumos.map((i) => {
                          // Verificar si este insumo está seleccionado en otra fila
                          const insumosSeleccionados = formData.insumos
                            .map((item, idx) => ({ id: String(item.insumoId), index: idx }))
                            .filter(item => item.id && item.id !== 'undefined' && item.index !== index);
                          
                          const insumoIdsSeleccionados = insumosSeleccionados.map(item => item.id);
                          const estaSeleccionadoEnOtro = insumoIdsSeleccionados.includes(String(i.id));
                          const esSeleccionActual = String(insumo.insumoId) === String(i.id);
                          
                          // Determinar si se debe mostrar información adicional
                          const tipoTexto = i.tipo === 'COMPUESTO' ? ' (Compuesto)' : ' (Base)';
                          const stockInfo = formData.tipoMovimiento === "SALIDA" ? ` - Stock: ${i.stockActual}` : "";
                          const yaSeleccionado = estaSeleccionadoEnOtro && !esSeleccionActual ? ' (ya seleccionado)' : '';
                          
                          return (
                            <option 
                              key={i.id} 
                              value={i.id}
                              disabled={estaSeleccionadoEnOtro && !esSeleccionActual}
                              style={{
                                color: estaSeleccionadoEnOtro && !esSeleccionActual ? '#999' : 'inherit',
                                fontStyle: estaSeleccionadoEnOtro && !esSeleccionActual ? 'italic' : 'normal'
                              }}
                            >
                              {i.nombre}{tipoTexto}{stockInfo}{yaSeleccionado}
                            </option>
                          );
                        }) : (
                          <option value="" disabled>
                            {error ? 'Error al cargar insumos' : 
                             loading ? 'Cargando...' : 
                             'No hay insumos disponibles. Crea insumos primero.'}
                          </option>
                        )}
                      </select>
                    </div>

                    {/* Cantidad */}
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-600 block">
                        Cantidad *
                        {insumo.insumoId && (() => {
                          const insumoSeleccionado = insumos.find(i => i.id === parseInt(insumo.insumoId));
                          return insumoSeleccionado ? ` (${insumoSeleccionado.unidadMedida})` : '';
                        })()}
                      </label>
                      <NumberInput
                        placeholder="0,00"
                        value={insumo.cantidad}
                        onChange={(value) => handleInsumoChange(index, 'cantidad', value)}
                        required
                        disabled={isSubmitting}
                        className="w-full px-3 py-2 text-sm"
                      />
                    </div>

                                      {/* Precio de Compra (solo para ENTRADA) */}
                  {formData.tipoMovimiento === "ENTRADA" && (
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-600 block">
                        Precio Total
                      </label>
                      <NumberInput
                        placeholder="0,00"
                        value={insumo.precioDeCompra}
                        onChange={(value) => handleInsumoChange(index, 'precioDeCompra', value)}
                        required
                        disabled={isSubmitting}
                        className="w-full px-3 py-2 text-sm"
                      />
                      <p className="text-xs text-gray-500">
                        Ej: $80,00 por 10 kg, $35,00 por 10 unidades
                      </p>
                    </div>
                  )}
                  </div>
                  
                  {/* Botón eliminar */}
                  <button
                    type="button"
                    onClick={() => removeInsumo(index)}
                    className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50 ml-4 flex-shrink-0"
                    disabled={isSubmitting || formData.insumos.length === 1}
                  >
                    <FaTrash size={14} />
                  </button>
                </div>


              </div>
            ))}
          </div>
        )}
      </div>

      {/* Nota informativa sobre insumos compuestos */}
      <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-2">
          <FaInfoCircle className="text-blue-600 mt-0.5" size={14} />
          <div className="text-sm text-blue-700">
            <p className="font-medium">💡 Tipos de Operaciones con Insumos</p>
            <div className="mt-1 space-y-1 text-xs">
              <p><strong>📦 Movimientos:</strong> Para comprar/vender insumos (base o compuestos ya existentes)</p>
              <p><strong>🔨 Ensamble:</strong> Para crear insumos compuestos desde cero usando componentes base</p>
              <p><strong>💡 Consejo:</strong> Si quieres ensamblar, ve a la lista de insumos y usa el botón "Ensamblar"</p>
            </div>
          </div>
        </div>
      </div>
    </FormModal>
  );
};

export default MovimientoInsumoModal; 
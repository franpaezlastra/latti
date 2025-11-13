import React, { useState, useEffect, useRef } from 'react';
import { FaHammer, FaCalendarAlt, FaInfoCircle, FaBox, FaCog } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { loadInsumos } from '../../../../store/actions/insumoActions';
import { useGlobalUpdate } from '../../../../hooks/useGlobalUpdate';
import FormModal from '../../../ui/FormModal';
import Input from '../../../ui/Input';
import NumberInput from '../../../ui/NumberInput';
import RecetaInsumoDisplay from '../../insumos/components/RecetaInsumoDisplay';
import api from '../../../../services/api';
import { API_ENDPOINTS } from '../../../../constants/api';
import { getTodayLocalString } from '../../../../utils/formatters';

const MovimientoInsumoCompuestoModal = ({ isOpen, onClose, onSubmit }) => {
  const dispatch = useDispatch();
  const insumos = useSelector((state) => state.insumos.insumos);
  const { updateAfterInsumoMovement } = useGlobalUpdate();
  
  // Estados del formulario - Solo para ensamble
  const [formData, setFormData] = useState({
    fecha: '',
    descripcion: '',
    insumoCompuestoId: '',
    cantidad: ''
  });
  
  // Estados de error
  const [error, setError] = useState(false);
  const [textoError, setTextoError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtrar solo insumos compuestos
  const insumosCompuestos = (insumos || []).filter(insumo => insumo.tipo === 'COMPUESTO');

  const wasOpenRef = useRef(false);

  // Reiniciar formulario solo cuando pasa de cerrado a abierto
  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      if (!insumos || insumos.length === 0) {
        dispatch(loadInsumos());
      }
      
      setFormData({
        fecha: getTodayLocalString(),
        descripcion: '',
        insumoCompuestoId: '',
        cantidad: ''
      });
      setError(false);
      setTextoError('');
    }

    wasOpenRef.current = isOpen;
  }, [isOpen, insumos, dispatch]);

  // Limpiar errores cuando el usuario cambia los inputs
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) {
      setError(false);
      setTextoError('');
    }
  };

  // Obtener el insumo compuesto seleccionado
  const insumoCompuestoSeleccionado = insumosCompuestos.find(
    insumo => insumo.id === parseInt(formData.insumoCompuestoId)
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(false);
    setTextoError('');
    setIsSubmitting(true);

    try {
      // Validaciones para ensamble
      if (!formData.insumoCompuestoId) {
        setError(true);
        setTextoError('Debes seleccionar un insumo compuesto');
        setIsSubmitting(false);
        return;
      }

      if (!formData.cantidad || parseFloat(formData.cantidad) <= 0) {
        setError(true);
        setTextoError('La cantidad debe ser mayor a 0');
        setIsSubmitting(false);
        return;
      }

      if (!formData.fecha) {
        setError(true);
        setTextoError('La fecha es obligatoria');
        setIsSubmitting(false);
        return;
      }

      if (!formData.descripcion.trim()) {
        setError(true);
        setTextoError('La descripción es obligatoria');
        setIsSubmitting(false);
        return;
      }

      // Llamar al endpoint de ensamble
      const endpoint = API_ENDPOINTS.INSUMOS.COMPUESTO_BY_ID(formData.insumoCompuestoId) + '/ensamblar';
      const data = {
        cantidad: parseFloat(formData.cantidad),
        fecha: formData.fecha,
        descripcion: formData.descripcion.trim()
      };

      const response = await api.post(endpoint, data);
      console.log('✅ Insumo ensamblado exitosamente:', response.data);

      // Actualizar datos y cerrar modal
      await updateAfterInsumoMovement();
      handleClose();
      
    } catch (error) {
      console.error('Error al procesar operación:', error);
      setError(true);
      setTextoError(error.response?.data?.error || 'Error inesperado');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      fecha: '',
      descripcion: '',
      insumoCompuestoId: '',
      cantidad: ''
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
      title="Ensamble de Insumo Compuesto"
      onSubmit={handleSubmit}
      submitText="Ensamblar"
      isSubmitting={isSubmitting}
      error={error}
      errorMessage={textoError}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6">
        {/* Información sobre ensamble */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
            <FaHammer className="text-purple-600" />
            Ensamble de Insumos Compuestos
          </h3>
          <p className="text-sm text-gray-600">
            Crea insumos compuestos usando componentes base. Se descontarán automáticamente los componentes del stock y se calculará el precio unitario.
          </p>
        </div>

        {/* Campos del formulario */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Insumo Compuesto */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Insumo Compuesto a Ensamblar *
            </label>
            <select
              value={formData.insumoCompuestoId}
              onChange={(e) => handleInputChange('insumoCompuestoId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
              required
              disabled={isSubmitting}
            >
              <option value="">Seleccione un insumo compuesto</option>
              {insumosCompuestos.map((insumo) => (
                <option key={insumo.id} value={insumo.id}>
                  {insumo.nombre} (Stock actual: {insumo.stockActual || 0})
                </option>
              ))}
            </select>
          </div>

          {/* Cantidad */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Cantidad a Ensamblar *
            </label>
            <NumberInput
              value={formData.cantidad}
              onChange={(value) => handleInputChange('cantidad', value)}
              placeholder="0"
              min="0"
              step="0.01"
              disabled={isSubmitting}
              required
            />
          </div>

          {/* Fecha */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Fecha del Ensamble *
            </label>
            <div className="relative">
              <input
                type="date"
                value={formData.fecha}
                onChange={(e) => handleInputChange('fecha', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
                required
                disabled={isSubmitting}
              />
              <FaCalendarAlt className="absolute right-3 top-2.5 text-gray-400" size={14} />
            </div>
          </div>

          {/* Descripción */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Descripción *
            </label>
            <Input
              type="text"
              value={formData.descripcion}
              onChange={(e) => handleInputChange('descripcion', e.target.value)}
              placeholder="Ej: Ensamble realizado en línea de producción"
              disabled={isSubmitting}
              required
            />
          </div>
        </div>

        {/* Mostrar receta del insumo compuesto */}
        {insumoCompuestoSeleccionado && insumoCompuestoSeleccionado.receta && (
          <RecetaInsumoDisplay receta={insumoCompuestoSeleccionado.receta} />
        )}

        {/* Información sobre el ensamble */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <FaInfoCircle className="text-blue-600 mt-0.5" size={14} />
            <div className="text-sm text-blue-700">
              <p className="font-medium">¿Qué sucede al ensamblar?</p>
              <ul className="mt-1 space-y-1 text-xs">
                <li>• Se descontarán automáticamente los componentes base del stock</li>
                <li>• Se agregará stock del insumo compuesto ensamblado</li>
                <li>• Se calculará el precio unitario basado en el costo de los componentes</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </FormModal>
  );
};

export default MovimientoInsumoCompuestoModal;

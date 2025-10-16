import React, { useState, useEffect } from 'react';
import { FaHammer, FaCalendarAlt, FaInfoCircle } from 'react-icons/fa';
import FormModal from '../../../ui/FormModal';
import Input from '../../../ui/Input';
import NumberInput from '../../../ui/NumberInput';
import RecetaInsumoDisplay from '../components/RecetaInsumoDisplay';
import api from '../../../../services/api';
import { API_ENDPOINTS } from '../../../../constants/api';

const EnsamblarInsumoCompuestoModal = ({ isOpen, onClose, insumoCompuesto, onSubmit }) => {
  const [formData, setFormData] = useState({
    cantidad: '',
    fecha: '',
    descripcion: ''
  });
  const [error, setError] = useState(false);
  const [textoError, setTextoError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Establecer fecha actual por defecto
  useEffect(() => {
    if (isOpen) {
      const hoy = new Date().toISOString().split('T')[0];
      setFormData(prev => ({
        ...prev,
        fecha: hoy,
        descripcion: `Ensamble de ${insumoCompuesto?.nombre || ''}`
      }));
    }
  }, [isOpen, insumoCompuesto]);

  // Limpiar formulario al cerrar
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        cantidad: '',
        fecha: '',
        descripcion: ''
      });
      setError(false);
      setTextoError('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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

    try {
      // Validaciones
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

      const data = {
        cantidad: parseFloat(formData.cantidad),
        fecha: formData.fecha,
        descripcion: formData.descripcion.trim()
      };

      // Llamar al endpoint de ensamble directamente
      const endpoint = API_ENDPOINTS.INSUMOS.COMPUESTO_BY_ID(insumoCompuesto.id) + '/ensamblar';
      const response = await api.post(endpoint, data);
      
      console.log('✅ Insumo ensamblado exitosamente:', response.data);
      
      // Llamar al callback del padre para manejar el éxito
      if (onSubmit) {
        await onSubmit(insumoCompuesto.id, data);
      }
      
      // Limpiar formulario y cerrar
      setFormData({
        cantidad: '',
        fecha: '',
        descripcion: ''
      });
      handleClose();
      
    } catch (error) {
      console.error('Error al ensamblar insumo:', error);
      setError(true);
      setTextoError(error.response?.data?.error || 'Error inesperado al ensamblar');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      cantidad: '',
      fecha: '',
      descripcion: ''
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
      title={`Ensamblar ${insumoCompuesto?.nombre || 'Insumo Compuesto'}`}
      submitText="Ensamblar"
      isSubmitting={isSubmitting}
      error={error}
      errorMessage={textoError}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Cantidad a ensamblar */}
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
          <p className="text-xs text-gray-500 mt-1">
            Cantidad de {insumoCompuesto?.nombre} que deseas ensamblar
          </p>
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
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
              disabled={isSubmitting}
              required
            />
            <FaCalendarAlt className="absolute right-3 top-2.5 text-gray-400" size={14} />
          </div>
        </div>

        {/* Descripción */}
        <div>
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

        {/* Mostrar receta del insumo compuesto */}
        {insumoCompuesto && insumoCompuesto.receta && (
          <RecetaInsumoDisplay receta={insumoCompuesto.receta} />
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
      </form>
    </FormModal>
  );
};

export default EnsamblarInsumoCompuestoModal;
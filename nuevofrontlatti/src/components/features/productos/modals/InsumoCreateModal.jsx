import React, { useState, useEffect } from 'react';
import FormModal from '../../../ui/FormModal';
import Input from '../../../ui/Input';
import { getUnidadesMedidaOptions } from '../../../../constants/unidadesMedida';

const InsumoCreateModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    unidadMedida: ''
  });
  const [error, setError] = useState(false);
  const [textoError, setTextoError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Obtener opciones de unidades de medida
  const unidadesMedidaOptions = getUnidadesMedidaOptions();

  // Debug: ver cuando cambia error
  useEffect(() => {
    console.log('InsumoCreateModal - error changed:', error);
    console.log('InsumoCreateModal - textoError changed:', textoError);
  }, [error, textoError]);

  // Función para limpiar errores cuando el usuario cambia los inputs
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar errores cuando el usuario empieza a escribir
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

    // Validaciones del frontend
    if (!formData.nombre.trim()) {
      setError(true);
      setTextoError('El nombre del insumo es obligatorio');
      setIsSubmitting(false);
      return;
    }

    if (!formData.unidadMedida.trim()) {
      setError(true);
      setTextoError('La unidad de medida es obligatoria');
      setIsSubmitting(false);
      return;
    }

    const insumoData = {
      nombre: formData.nombre.trim(),
      unidadMedida: formData.unidadMedida.trim()
    };

    try {
      const result = await onSubmit(insumoData);
      console.log('InsumoCreateModal - onSubmit result:', result);
      if (result && result.error) {
        console.log('InsumoCreateModal - setting error:', result.error);
        setError(true);
        setTextoError(result.error);
      }
    } catch (error) {
      console.log('InsumoCreateModal - catch error:', error);
      setError(true);
      setTextoError('Error inesperado al crear insumo');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({ nombre: '', unidadMedida: '' });
    setError(false);
    setTextoError('');
    setIsSubmitting(false);
    onClose();
  };

  // Debug: mostrar el error que llega
  console.log('InsumoCreateModal - error prop:', null);
  console.log('InsumoCreateModal - error state:', error);
  console.log('InsumoCreateModal - textoError:', textoError);
  console.log('InsumoCreateModal - isOpen:', isOpen);

  // Si el modal se cierra, limpiar el estado
  useEffect(() => {
    if (!isOpen) {
      setFormData({ nombre: '', unidadMedida: '' });
      setError(false);
      setTextoError('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  return (
    <FormModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Crear Nuevo Insumo"
      onSubmit={handleSubmit}
      submitText="Crear Insumo"
      isSubmitting={isSubmitting}
      error={error}
      errorMessage={textoError}
      maxWidth="max-w-md"
    >
      <Input
        label="Nombre del Insumo"
        placeholder="Ingrese el nombre del insumo"
        value={formData.nombre}
        onChange={(e) => handleInputChange('nombre', e.target.value)}
        required
        disabled={isSubmitting}
      />

      {/* ✅ CAMBIADO: Select estandarizado para unidades de medida */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Unidad de Medida *
        </label>
        <select
          value={formData.unidadMedida}
          onChange={(e) => handleInputChange('unidadMedida', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
          required
          disabled={isSubmitting}
        >
          <option value="">Seleccione una unidad</option>
          {unidadesMedidaOptions.map((unidad) => (
            <option key={unidad.value} value={unidad.value}>
              {unidad.label}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500">
          Seleccione la unidad de medida estandarizada para este insumo
        </p>
      </div>
    </FormModal>
  );
};

export default InsumoCreateModal; 
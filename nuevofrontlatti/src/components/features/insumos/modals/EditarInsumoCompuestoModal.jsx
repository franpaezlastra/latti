import React, { useState, useEffect } from 'react';
import { FaEdit, FaPlus, FaTrash, FaCog, FaBox } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { updateInsumoCompuesto } from '../../../../store/slices/insumoSlice';
import FormModal from '../../../ui/FormModal';
import Input from '../../../ui/Input';
import NumberInput from '../../../ui/NumberInput';
import { getUnidadesMedidaOptions } from '../../../../constants/unidadesMedida';

const EditarInsumoCompuestoModal = ({ isOpen, onClose, insumo, onSubmit }) => {
  const dispatch = useDispatch();
  const { insumos, loading } = useSelector((state) => state.insumos);
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    unidadMedida: '',
    receta: []
  });
  
  // Estados de error
  const [error, setError] = useState(false);
  const [textoError, setTextoError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtrar solo insumos base para la receta
  const insumosBase = insumos.filter(insumo => !insumo.tipo || insumo.tipo === 'BASE');

  // Función para capitalizar la primera letra
  const capitalizarPrimeraLetra = (texto) => {
    if (!texto) return texto;
    return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
  };

  // Cargar datos del insumo cuando se abre el modal
  useEffect(() => {
    if (isOpen && insumo) {
      // Convertir la receta del formato del backend al formato esperado por el modal
      let recetaFormateada = [];
      if (insumo.receta && insumo.receta.length > 0) {
        recetaFormateada = insumo.receta.map(componente => ({
          insumoBaseId: componente.insumoBaseId.toString(),
          cantidad: componente.cantidad.toString()
        }));
      }

      setFormData({
        nombre: insumo.nombre || '',
        unidadMedida: insumo.unidadMedida || '',
        receta: recetaFormateada
      });
      setError(false);
      setTextoError('');
      setIsSubmitting(false);
    }
  }, [isOpen, insumo]);

  // Limpiar formulario al cerrar
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        nombre: '',
        unidadMedida: '',
        receta: []
      });
      setError(false);
      setTextoError('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleInputChange = (field, value) => {
    // Capitalizar automáticamente el nombre mientras se escribe
    if (field === 'nombre') {
      setFormData(prev => ({ ...prev, [field]: capitalizarPrimeraLetra(value) }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    
    if (error) {
      setError(false);
      setTextoError('');
    }
  };

  const handleRecetaChange = (index, field, value) => {
    const nuevaReceta = [...formData.receta];
    nuevaReceta[index] = { ...nuevaReceta[index], [field]: value };
    setFormData(prev => ({ ...prev, receta: nuevaReceta }));
  };

  const agregarComponente = () => {
    setFormData(prev => ({
      ...prev,
      receta: [...prev.receta, { insumoBaseId: '', cantidad: '' }]
    }));
  };

  const eliminarComponente = (index) => {
    const nuevaReceta = formData.receta.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, receta: nuevaReceta }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(false);
    setTextoError('');
    setIsSubmitting(true);

    try {
      // Validaciones
      if (!formData.nombre.trim()) {
        setError(true);
        setTextoError('El nombre es obligatorio');
        setIsSubmitting(false);
        return;
      }

      if (!formData.unidadMedida) {
        setError(true);
        setTextoError('La unidad de medida es obligatoria');
        setIsSubmitting(false);
        return;
      }

      if (!formData.receta || formData.receta.length === 0) {
        setError(true);
        setTextoError('Debe agregar al menos un componente a la receta');
        setIsSubmitting(false);
        return;
      }

      // Validar receta
      for (let i = 0; i < formData.receta.length; i++) {
        const componente = formData.receta[i];
        if (!componente.insumoBaseId) {
          setError(true);
          setTextoError(`Debe seleccionar un insumo base para el componente ${i + 1}`);
          setIsSubmitting(false);
          return;
        }
        if (!componente.cantidad || parseFloat(componente.cantidad) <= 0) {
          setError(true);
          setTextoError(`La cantidad del componente ${i + 1} debe ser mayor a 0`);
          setIsSubmitting(false);
          return;
        }
      }

      // Verificar que no haya insumos duplicados en la receta
      const insumosIds = formData.receta.map(c => c.insumoBaseId);
      const insumosDuplicados = insumosIds.filter((id, index) => insumosIds.indexOf(id) !== index);
      if (insumosDuplicados.length > 0) {
        setError(true);
        setTextoError('No puedes usar el mismo insumo base múltiples veces en la receta');
        setIsSubmitting(false);
        return;
      }

      // Preparar datos según el formato que espera el backend (CrearInsumoCompuestoDTO)
      const insumoData = {
        nombre: capitalizarPrimeraLetra(formData.nombre.trim()),
        unidadMedida: formData.unidadMedida, // Ya es un ENUM válido, no hacer trim()
        receta: formData.receta.map(c => ({
          insumoBaseId: parseInt(c.insumoBaseId),
          cantidad: parseFloat(c.cantidad)
        }))
      };

      // Verificar autenticación antes de enviar
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      console.log('🔐 Token presente:', !!token);
      console.log('👤 Usuario:', user ? (() => {
        try {
          return JSON.parse(user);
        } catch (e) {
          return user;
        }
      })() : 'No encontrado');

      console.log('📤 Enviando datos al backend:', {
        id: insumo.id,
        insumoData
      });

      const result = await dispatch(updateInsumoCompuesto({ id: insumo.id, insumoData }));
      
      if (updateInsumoCompuesto.fulfilled.match(result)) {
        console.log('✅ Insumo compuesto actualizado exitosamente');
        // Llamar al callback del padre para manejar el éxito
        if (onSubmit) {
          await onSubmit(insumoData);
        }
        handleClose();
      } else {
        // Extraer el error del backend
        const errorMessage = result.payload || "Error al actualizar insumo compuesto";
        console.error('❌ Error del backend:', errorMessage);
        setError(true);
        setTextoError(typeof errorMessage === 'string' ? errorMessage : "Error al actualizar insumo compuesto");
      }
      
    } catch (error) {
      console.error('❌ Error inesperado al editar insumo compuesto:', error);
      setError(true);
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          error.message ||
                          'Error inesperado al editar insumo compuesto';
      setTextoError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      nombre: '',
      unidadMedida: '',
      receta: []
    });
    setError(false);
    setTextoError('');
    setIsSubmitting(false);
    onClose();
  };

  // Obtener insumos ya seleccionados para deshabilitar en otros componentes
  const insumosYaSeleccionados = formData.receta.map(c => c.insumoBaseId).filter(id => id !== '');

  return (
    <FormModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Editar Insumo Compuesto"
      onSubmit={handleSubmit}
      submitText="Actualizar"
      isSubmitting={isSubmitting}
      error={error}
      errorMessage={textoError}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6">
        {/* Información básica */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Nombre del Insumo *
            </label>
            <Input
              type="text"
              value={formData.nombre}
              onChange={(e) => handleInputChange('nombre', e.target.value)}
              placeholder="Ej: Botella Armada, Kit Completo"
              disabled={isSubmitting}
              required
            />
          </div>

          {/* Unidad de Medida */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
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
              {getUnidadesMedidaOptions().map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Receta del insumo compuesto */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <FaCog className="text-purple-600" />
              Receta del Insumo Compuesto
            </h3>
            <button
              type="button"
              onClick={agregarComponente}
              className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
              disabled={isSubmitting}
            >
              <FaPlus size={12} />
              Agregar Componente
            </button>
          </div>

          {formData.receta.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FaBox className="mx-auto mb-2 text-gray-400" size={24} />
              <p>No hay componentes en la receta</p>
              <p className="text-sm">Agrega componentes para definir la receta</p>
            </div>
          ) : (
            <div className="space-y-3">
              {formData.receta.map((componente, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Insumo Base *
                    </label>
                    <select
                      value={componente.insumoBaseId}
                      onChange={(e) => handleRecetaChange(index, 'insumoBaseId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
                      required
                      disabled={isSubmitting}
                    >
                      <option value="">Seleccione un insumo base</option>
                      {insumosBase.map((insumoBase) => {
                        const yaSeleccionado = insumosYaSeleccionados.includes(insumoBase.id.toString());
                        const esElActual = insumoBase.id.toString() === componente.insumoBaseId;
                        return (
                          <option 
                            key={insumoBase.id} 
                            value={insumoBase.id}
                            disabled={yaSeleccionado && !esElActual}
                          >
                            {insumoBase.nombre} {yaSeleccionado && !esElActual ? '(ya seleccionado)' : ''}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Cantidad *
                    </label>
                    <NumberInput
                      value={componente.cantidad}
                      onChange={(value) => handleRecetaChange(index, 'cantidad', value)}
                      placeholder="0"
                      min="0"
                      step="0.01"
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => eliminarComponente(index)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      disabled={isSubmitting}
                    >
                      <FaTrash size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Información sobre edición */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <FaEdit className="text-blue-600 mt-0.5" size={14} />
            <div className="text-sm text-blue-700">
              <p className="font-medium">Información sobre la edición</p>
              <ul className="mt-1 space-y-1 text-xs">
                <li>• Puedes modificar el nombre, unidad de medida y receta</li>
                <li>• Los cambios en la receta no afectan el stock existente</li>
                <li>• Cada insumo base solo puede aparecer una vez en la receta</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </FormModal>
  );
};

export default EditarInsumoCompuestoModal;

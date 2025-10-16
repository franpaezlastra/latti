import React, { useState, useEffect } from 'react';
import { FaEdit, FaBox, FaCog } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { updateInsumo } from '../../../../store/slices/insumoSlice';
import FormModal from '../../../ui/FormModal';
import Input from '../../../ui/Input';
import { getUnidadesMedidaOptions } from '../../../../constants/unidadesMedida';

const EditarInsumoModal = ({ isOpen, onClose, insumo, onSubmit }) => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.insumos);
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    unidadMedida: '',
    tipo: 'BASE'
  });
  
  // Estados de error
  const [error, setError] = useState(false);
  const [textoError, setTextoError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Función para capitalizar la primera letra
  const capitalizarPrimeraLetra = (texto) => {
    if (!texto) return texto;
    return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
  };

  // Cargar datos del insumo cuando se abre el modal
  useEffect(() => {
    if (isOpen && insumo) {
      setFormData({
        nombre: insumo.nombre || '',
        unidadMedida: insumo.unidadMedida || '',
        tipo: insumo.tipoOriginal || insumo.tipo || 'BASE'
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
        tipo: 'BASE'
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('🔄 Iniciando actualización de insumo:', insumo);
    console.log('📝 Datos del formulario:', formData);
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

      const insumoData = {
        id: insumo.id,
        nombre: capitalizarPrimeraLetra(formData.nombre.trim()),
        unidadMedida: formData.unidadMedida.trim(),
        tipo: formData.tipo
      };

      const result = await dispatch(updateInsumo({ id: insumo.id, insumoData }));
      console.log('📤 Resultado del dispatch:', result);
      
      if (updateInsumo.fulfilled.match(result)) {
        console.log('✅ Actualización exitosa');
        // Llamar al callback del padre para manejar el éxito
        if (onSubmit) {
          await onSubmit(insumoData);
        }
        handleClose();
      } else {
        // Extraer el error del backend
        const errorMessage = result.payload?.error || "Error al actualizar insumo";
        setError(true);
        setTextoError(errorMessage);
      }
      
    } catch (error) {
      console.error('Error al editar insumo:', error);
      setError(true);
      setTextoError('Error inesperado al editar insumo');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      nombre: '',
      unidadMedida: '',
      tipo: 'BASE'
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
      title={`Editar Insumo ${insumo?.tipoOriginal === 'COMPUESTO' ? 'Compuesto' : 'Simple'}`}
      onSubmit={handleSubmit}
      submitText="Actualizar"
      isSubmitting={isSubmitting}
      error={error}
      errorMessage={textoError}
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        {/* Nombre */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Nombre del Insumo *
          </label>
          <Input
            type="text"
            value={formData.nombre}
            onChange={(e) => handleInputChange('nombre', e.target.value)}
            placeholder="Ej: Botella, Tapa, Etiqueta"
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

        {/* Tipo de Insumo (solo lectura) */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Tipo de Insumo
          </label>
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg">
            {formData.tipo === 'COMPUESTO' ? (
              <FaCog className="text-purple-600" size={14} />
            ) : (
              <FaBox className="text-blue-600" size={14} />
            )}
            <span className={`text-sm font-medium px-2 py-1 rounded-full ${
              formData.tipo === 'COMPUESTO' 
                ? 'bg-purple-100 text-purple-800' 
                : 'bg-blue-100 text-blue-800'
            }`}>
              {formData.tipo === 'COMPUESTO' ? 'Compuesto' : 'Simple (Base)'}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            El tipo de insumo no se puede cambiar una vez creado
          </p>
        </div>

        {/* Información sobre edición */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <FaEdit className="text-blue-600 mt-0.5" size={14} />
            <div className="text-sm text-blue-700">
              <p className="font-medium">Información sobre la edición</p>
              <ul className="mt-1 space-y-1 text-xs">
                <li>• Solo puedes editar el nombre y la unidad de medida</li>
                <li>• El tipo de insumo no se puede modificar</li>
                <li>• Los cambios no afectan el stock existente</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </FormModal>
  );
};

export default EditarInsumoModal;

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
    tipo: 'BASE',
    stockMinimo: 0
  });
  
  // Estados de error
  const [error, setError] = useState(false);
  const [textoError, setTextoError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [insumoEnUso, setInsumoEnUso] = useState(false);

  // Función para capitalizar la primera letra
  const capitalizarPrimeraLetra = (texto) => {
    if (!texto) return texto;
    return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
  };

  // Cargar datos del insumo cuando se abre el modal
  useEffect(() => {
    if (isOpen && insumo) {
      console.log('📝 ============ CARGANDO INSUMO EN MODAL ============');
      console.log('📦 Propiedades principales del insumo:');
      console.log('  - ID:', insumo.id);
      console.log('  - Nombre:', insumo.nombre);
      console.log('  - Tipo:', insumo.tipo);
      console.log('  - Tipo Original:', insumo.tipoOriginal);
      console.log('🔍 Stock Mínimo:');
      console.log('  - insumo.stockMinimo:', insumo.stockMinimo);
      console.log('  - insumo.stockMinimoOriginal:', insumo.stockMinimoOriginal);
      console.log('  - typeof insumo.stockMinimo:', typeof insumo.stockMinimo);
      console.log('  - typeof insumo.stockMinimoOriginal:', typeof insumo.stockMinimoOriginal);
      
      // Usar valores originales si existen (vienen de la tabla formateada)
      const unidadMedida = insumo.unidadMedidaOriginal || insumo.unidadMedida || '';
      const stockMinimo = insumo.stockMinimoOriginal !== undefined ? insumo.stockMinimoOriginal : (insumo.stockMinimo !== undefined ? insumo.stockMinimo : 0);
      
      console.log('✅ Valores finales a usar:');
      console.log('  - Nombre:', insumo.nombre);
      console.log('  - Unidad de Medida:', unidadMedida);
      console.log('  - Stock Mínimo:', stockMinimo);
      console.log('  - Tipo:', insumo.tipoOriginal || insumo.tipo || 'BASE');
      console.log('📝 ============================================');
      
      setFormData({
        nombre: insumo.nombre || '',
        unidadMedida: unidadMedida,
        tipo: insumo.tipoOriginal || insumo.tipo || 'BASE',
        stockMinimo: stockMinimo
      });
      setError(false);
      setTextoError('');
      setIsSubmitting(false);
      setInsumoEnUso(false);
    }
  }, [isOpen, insumo]);

  // Limpiar formulario al cerrar
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        nombre: '',
        unidadMedida: '',
        tipo: 'BASE',
        stockMinimo: 0
      });
      setError(false);
      setTextoError('');
      setIsSubmitting(false);
      setInsumoEnUso(false);
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
        stockMinimo: parseFloat(formData.stockMinimo) || 0,
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
        // El payload ya es el mensaje de error (string)
        const errorMessage = result.payload || result.error?.message || "Error al actualizar insumo";
        
        console.log('❌ Error capturado:', errorMessage);
        
        // Detectar si el insumo está en uso
        if (errorMessage.includes("en uso") || errorMessage.includes("Solo puedes modificar")) {
          setInsumoEnUso(true);
        }
        
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
      tipo: 'BASE',
      stockMinimo: 0
    });
    setError(false);
    setTextoError('');
    setIsSubmitting(false);
    setInsumoEnUso(false);
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
        {/* Advertencia si el insumo está en uso */}
        {insumoEnUso && (
          <div className="bg-red-50 border border-red-300 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <FaEdit className="text-red-600 mt-0.5" size={14} />
              <div className="text-sm text-red-700">
                <p className="font-bold">⚠️ Insumo en Uso</p>
                <p className="mt-1">
                  Este insumo ya está siendo utilizado en movimientos o recetas.
                  Solo puedes modificar el <strong>Stock Mínimo</strong>.
                </p>
              </div>
            </div>
          </div>
        )}

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
            disabled={isSubmitting || insumoEnUso}
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
            disabled={isSubmitting || insumoEnUso}
          >
            <option value="">Seleccione una unidad</option>
            {getUnidadesMedidaOptions().map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Stock Mínimo - SIEMPRE editable */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Stock Mínimo *
          </label>
          <Input
            type="number"
            value={formData.stockMinimo}
            onChange={(e) => handleInputChange('stockMinimo', e.target.value)}
            placeholder="Ej: 10"
            min="0"
            step="0.01"
            disabled={isSubmitting}
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Cuando el stock sea igual o menor a este valor, se mostrará una alerta de stock bajo
          </p>
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
        {!insumoEnUso && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <FaEdit className="text-blue-600 mt-0.5" size={14} />
            <div className="text-sm text-blue-700">
              <p className="font-medium">Información sobre la edición</p>
              <ul className="mt-1 space-y-1 text-xs">
                  <li>• Puedes editar el nombre, unidad de medida y stock mínimo</li>
                <li>• El tipo de insumo no se puede modificar</li>
                <li>• Los cambios no afectan el stock existente</li>
              </ul>
            </div>
          </div>
        </div>
        )}
      </div>
    </FormModal>
  );
};

export default EditarInsumoModal;

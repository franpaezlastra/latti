import React, { useState, useEffect } from 'react';
import { FaCog, FaBox, FaPlus, FaTrash } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { fetchInsumos } from '../../../../store/slices/insumoSlice';
import api from '../../../../services/api';
import { API_ENDPOINTS } from '../../../../constants/api';
import FormModal from '../../../ui/FormModal';
import Input from '../../../ui/Input';
import { getUnidadesMedidaOptions } from '../../../../constants/unidadesMedida';

const InsumoCreateModal = ({ isOpen, onClose, onSubmit, onRefresh }) => {
  const dispatch = useDispatch();
  const insumos = useSelector((state) => state.insumos.insumos);
  
  const [formData, setFormData] = useState({
    nombre: '',
    unidadMedida: '',
    tipo: 'BASE'
  });
  const [error, setError] = useState(false);
  const [textoError, setTextoError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estados para insumos compuestos
  const [receta, setReceta] = useState([]);

  // Obtener opciones de unidades de medida
  const unidadesMedidaOptions = getUnidadesMedidaOptions();

  // Debug: ver cuando cambia error
  useEffect(() => {
    console.log('InsumoCreateModal - error changed:', error);
    console.log('InsumoCreateModal - textoError changed:', textoError);
  }, [error, textoError]);

  // Cargar insumos base disponibles al abrir el modal
  useEffect(() => {
    if (isOpen) {
      console.log('🔍 Insumos disponibles:', insumos);
      console.log('🔍 Cantidad de insumos:', insumos?.length);
      
      // Siempre cargar insumos para asegurar datos actualizados
      console.log('📥 Cargando insumos...');
      dispatch(fetchInsumos());
    }
  }, [isOpen, dispatch]);

  // Función para limpiar errores cuando el usuario cambia los inputs
  const handleInputChange = (field, value) => {
    // Capitalizar automáticamente el nombre mientras se escribe
    if (field === 'nombre') {
      setFormData(prev => ({ ...prev, [field]: capitalizarPrimeraLetra(value) }));
    } else {
    setFormData(prev => ({ ...prev, [field]: value }));
    }
    
    // Si cambia el tipo a BASE, limpiar receta
    if (field === 'tipo' && value === 'BASE') {
      setReceta([]);
    }
    
    // Limpiar errores cuando el usuario empieza a escribir
    if (error) {
      setError(false);
      setTextoError('');
    }
  };

  // Funciones para manejar la receta de insumos compuestos
  const addComponenteReceta = () => {
    setReceta([...receta, { insumoBaseId: '', cantidad: '' }]);
  };

  const removeComponenteReceta = (index) => {
    setReceta(receta.filter((_, i) => i !== index));
  };

  const updateComponenteReceta = (index, field, value) => {
    const nuevaReceta = [...receta];
    nuevaReceta[index] = { ...nuevaReceta[index], [field]: value };
    setReceta(nuevaReceta);
  };

  // Función para capitalizar la primera letra
  const capitalizarPrimeraLetra = (texto) => {
    if (!texto) return texto;
    return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
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

    // Validaciones específicas para insumos compuestos
    if (formData.tipo === 'COMPUESTO') {
      if (receta.length === 0) {
        setError(true);
        setTextoError('Los insumos compuestos deben tener al menos un componente');
        setIsSubmitting(false);
        return;
      }

      // Validar que todos los componentes tengan datos válidos
      for (const componente of receta) {
        if (!componente.insumoBaseId || !componente.cantidad || parseFloat(componente.cantidad) <= 0) {
          setError(true);
          setTextoError('Todos los componentes deben tener insumo y cantidad válida');
          setIsSubmitting(false);
          return;
        }
      }

      // Validar que no haya componentes duplicados
      const insumoIds = receta.map(c => c.insumoBaseId);
      if (new Set(insumoIds).size !== insumoIds.length) {
        setError(true);
        setTextoError('No puede duplicar un insumo base en la receta');
        setIsSubmitting(false);
        return;
      }
    }

    const insumoData = {
      nombre: capitalizarPrimeraLetra(formData.nombre.trim()),
      unidadMedida: formData.unidadMedida.trim(),
      tipo: formData.tipo,
      ...(formData.tipo === 'COMPUESTO' && { receta })
    };

    try {
      // Usar endpoint correcto según el tipo de insumo
      let endpoint;
      if (formData.tipo === 'COMPUESTO') {
        endpoint = API_ENDPOINTS.INSUMOS.COMPUESTOS;
      } else {
        endpoint = API_ENDPOINTS.INSUMOS.BASE;
      }

      console.log('📤 Enviando a endpoint:', endpoint);
      console.log('📤 Datos:', insumoData);

      const response = await api.post(endpoint, insumoData);
      console.log('✅ Respuesta del servidor:', response.data);
      
      // Cerrar modal y limpiar formulario
      setFormData({
        nombre: '',
        unidadMedida: '',
        tipo: 'BASE'
      });
      setReceta([]);
      
      // Refrescar la lista de insumos
      if (onRefresh) {
        onRefresh();
      }
      
      handleClose();
      
    } catch (error) {
      console.log('❌ Error:', error);
      setError(true);
      setTextoError(error.response?.data?.error || 'Error inesperado al crear insumo');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({ nombre: '', unidadMedida: '', tipo: 'BASE' });
    setReceta([]);
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
      setFormData({ nombre: '', unidadMedida: '', tipo: 'BASE' });
      setReceta([]);
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
      maxWidth="max-w-2xl"
    >
      {/* Selección de tipo de insumo */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Tipo de Insumo *
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
            formData.tipo === 'BASE' 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-200 hover:border-gray-300'
          }`}>
            <input
              type="radio"
              name="tipo"
              value="BASE"
              checked={formData.tipo === 'BASE'}
              onChange={(e) => handleInputChange('tipo', e.target.value)}
              className="sr-only"
              disabled={isSubmitting}
            />
            <div className="flex items-center space-x-3">
              <FaBox className={`text-xl ${formData.tipo === 'BASE' ? 'text-blue-600' : 'text-gray-400'}`} />
              <div>
                <div className={`font-medium ${formData.tipo === 'BASE' ? 'text-blue-900' : 'text-gray-700'}`}>
                  Insumo Base
                </div>
                <div className={`text-sm ${formData.tipo === 'BASE' ? 'text-blue-700' : 'text-gray-500'}`}>
                  Insumo simple que se compra directamente
                </div>
              </div>
            </div>
          </label>

          <label className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
            formData.tipo === 'COMPUESTO' 
              ? 'border-purple-500 bg-purple-50' 
              : 'border-gray-200 hover:border-gray-300'
          }`}>
            <input
              type="radio"
              name="tipo"
              value="COMPUESTO"
              checked={formData.tipo === 'COMPUESTO'}
              onChange={(e) => handleInputChange('tipo', e.target.value)}
              className="sr-only"
              disabled={isSubmitting}
            />
            <div className="flex items-center space-x-3">
              <FaCog className={`text-xl ${formData.tipo === 'COMPUESTO' ? 'text-purple-600' : 'text-gray-400'}`} />
              <div>
                <div className={`font-medium ${formData.tipo === 'COMPUESTO' ? 'text-purple-900' : 'text-gray-700'}`}>
                  Insumo Compuesto
                </div>
                <div className={`text-sm ${formData.tipo === 'COMPUESTO' ? 'text-purple-700' : 'text-gray-500'}`}>
                  Se ensambla con otros insumos base
                </div>
              </div>
            </div>
          </label>
        </div>
      </div>

      <Input
        label="Nombre del Insumo"
        placeholder="Ingrese el nombre del insumo"
        value={formData.nombre}
        onChange={(e) => handleInputChange('nombre', e.target.value)}
        required
        disabled={isSubmitting}
      />

      {/* Select para unidades de medida */}
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

      {/* Sección de receta para insumos compuestos */}
      {formData.tipo === 'COMPUESTO' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">
              Receta del Insumo Compuesto *
            </label>
            <button
              type="button"
              onClick={addComponenteReceta}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-300 transition-colors"
              disabled={isSubmitting}
            >
              <FaPlus size={12} />
              Agregar Componente
            </button>
          </div>


          {/* Lista de componentes */}
          {receta.length === 0 ? (
            <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
              <FaBox className="text-3xl text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-medium">No hay componentes agregados</p>
              <p className="text-xs mt-1">Haz clic en "Agregar Componente" para comenzar</p>
            </div>
          ) : (
            <div className="space-y-3">
              {receta.map((componente, index) => (
                <div key={index} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-700">
                      Componente {index + 1}
                    </h4>
                    <button
                      type="button"
                      onClick={() => removeComponenteReceta(index)}
                      className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                      disabled={isSubmitting}
                    >
                      <FaTrash size={12} />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Insumo Base *
                      </label>
                      <select
                        value={componente.insumoBaseId}
                        onChange={(e) => updateComponenteReceta(index, 'insumoBaseId', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
                        required
                        disabled={isSubmitting}
                      >
                        <option value="">Seleccionar insumo base</option>
                        {insumos && insumos.filter(insumo => {
                          const esBase = !insumo.tipo || insumo.tipo === 'BASE';
                          console.log(`🔍 Insumo ${insumo.nombre}: tipo=${insumo.tipo}, esBase=${esBase}`);
                          return esBase;
                        }).map((insumo) => {
                          // Verificar si este insumo ya está seleccionado en otro componente
                          const insumosYaSeleccionados = receta
                            .map((comp, idx) => ({ id: comp.insumoBaseId, index: idx }))
                            .filter(comp => comp.id && comp.id !== '' && comp.index !== index);
                          
                          const insumoIdsYaSeleccionados = insumosYaSeleccionados.map(comp => comp.id);
                          const estaSeleccionadoEnOtro = insumoIdsYaSeleccionados.includes(String(insumo.id));
                          const esSeleccionActual = String(componente.insumoBaseId) === String(insumo.id);
                          
                          return (
                            <option 
                              key={insumo.id} 
                              value={insumo.id}
                              disabled={estaSeleccionadoEnOtro && !esSeleccionActual}
                              style={{
                                color: estaSeleccionadoEnOtro && !esSeleccionActual ? '#999' : 'inherit',
                                fontStyle: estaSeleccionadoEnOtro && !esSeleccionActual ? 'italic' : 'normal'
                              }}
                            >
                              {insumo.nombre} ({insumo.unidadMedida})
                              {estaSeleccionadoEnOtro && !esSeleccionActual ? ' (ya seleccionado)' : ''}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Cantidad *
                        {componente.insumoBaseId && (() => {
                          const insumoSeleccionado = insumos.find(i => i.id === parseInt(componente.insumoBaseId));
                          return insumoSeleccionado ? ` (${insumoSeleccionado.unidadMedida})` : '';
                        })()}
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={componente.cantidad}
                        onChange={(e) => updateComponenteReceta(index, 'cantidad', e.target.value)}
                        placeholder="0.00"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </FormModal>
  );
};

export default InsumoCreateModal; 
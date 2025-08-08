import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrash } from 'react-icons/fa';
import FormModal from '../../../ui/FormModal';
import Button from '../../../ui/Button';
import Input from '../../../ui/Input';
import NumberInput from '../../../ui/NumberInput';

const ProductoEditModal = ({ isOpen, onClose, onSubmit, producto, insumos = [] }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    insumos: []
  });
  const [error, setError] = useState(false);
  const [textoError, setTextoError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cargar datos del producto cuando se abre el modal
  useEffect(() => {
    if (producto) {
      console.log('Producto a editar:', producto);
      console.log('Receta del producto:', producto.receta);
      
      setFormData({
        nombre: producto.nombre || '',
        insumos: producto.receta?.map(det => ({
          insumoId: det.insumoId,
          cantidad: det.cantidadNecesaria
        })) || []
      });
      setError(false);
      setTextoError('');
    }
  }, [producto, isOpen]);

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

    // Validaciones
    if (!formData.nombre.trim()) {
      setError(true);
      setTextoError('El nombre del producto es obligatorio');
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

    // Verificar insumos duplicados
    const insumoIds = formData.insumos.map(i => i.insumoId);
    if (new Set(insumoIds).size !== insumoIds.length) {
      setError(true);
      setTextoError('No puede seleccionar el mismo insumo más de una vez');
      setIsSubmitting(false);
      return;
    }

    const productoData = {
      nombre: formData.nombre.trim(),
      insumos: formData.insumos.map(insumo => ({
        insumoId: insumo.insumoId,
        cantidad: parseFloat(insumo.cantidad)
      }))
    };

    try {
      const result = await onSubmit(productoData);
      if (result && result.error) {
        setError(true);
        setTextoError(result.error);
      }
    } catch (error) {
      setError(true);
      setTextoError('Error inesperado al actualizar producto');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      nombre: '',
      insumos: []
    });
    setError(false);
    setTextoError('');
    setIsSubmitting(false);
    onClose();
  };

  // Si el modal se cierra, limpiar el estado
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        nombre: '',
        insumos: []
      });
      setError(false);
      setTextoError('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const addInsumo = () => {
    setFormData(prev => ({
      ...prev,
      insumos: [...prev.insumos, { insumoId: '', cantidad: '' }]
    }));
    // Limpiar errores cuando se agrega un insumo
    if (error) {
      setError(false);
      setTextoError('');
    }
  };

  const removeInsumo = (index) => {
    setFormData(prev => ({
      ...prev,
      insumos: prev.insumos.filter((_, i) => i !== index)
    }));
    // Limpiar errores cuando se quita un insumo
    if (error) {
      setError(false);
      setTextoError('');
    }
  };

  const updateInsumo = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      insumos: prev.insumos.map((insumo, i) => 
        i === index ? { ...insumo, [field]: value } : insumo
      )
    }));
    // Limpiar errores cuando el usuario cambia los inputs
    if (error) {
      setError(false);
      setTextoError('');
    }
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Editar Producto"
      onSubmit={handleSubmit}
      submitText="Guardar Cambios"
      isSubmitting={isSubmitting}
      error={error}
      errorMessage={textoError}
      maxWidth="max-w-2xl"
    >
      {/* Nombre del producto - FIJOS */}
      <Input
        label="Nombre del Producto"
        placeholder="Ingrese el nombre del producto"
        value={formData.nombre}
        onChange={(e) => handleInputChange('nombre', e.target.value)}
        required
        disabled={isSubmitting}
      />

      {/* Sección de insumos con scroll interno */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Receta del Producto</h3>
          <Button
            type="button"
            onClick={addInsumo}
            variant="outline"
            size="small"
            className="flex items-center gap-2"
            disabled={isSubmitting}
          >
            <FaPlus size={12} />
            Agregar Insumo
          </Button>
        </div>

        {formData.insumos.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <p className="text-sm">No hay insumos agregados</p>
            <p className="text-xs mt-1">Haz clic en "Agregar Insumo" para comenzar</p>
          </div>
        ) : (
          <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
            {formData.insumos.map((insumo, index) => (
              <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <select
                    value={insumo.insumoId}
                    onChange={(e) => updateInsumo(index, 'insumoId', e.target.value)}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                    required
                    disabled={isSubmitting}
                  >
                    <option value="">Seleccionar insumo</option>
                    {insumos.map((i) => {
                      // Verificar si este insumo está seleccionado en otra fila
                      const insumosSeleccionados = formData.insumos
                        .map((item, idx) => ({ id: String(item.insumoId), index: idx }))
                        .filter(item => item.id && item.id !== 'undefined' && item.index !== index);
                      
                      const insumoIdsSeleccionados = insumosSeleccionados.map(item => item.id);
                      const estaSeleccionadoEnOtra = insumoIdsSeleccionados.includes(String(i.id));
                      const esSeleccionActual = String(insumo.insumoId) === String(i.id);
                      
                      return (
                        <option 
                          key={i.id} 
                          value={i.id}
                          disabled={estaSeleccionadoEnOtra && !esSeleccionActual}
                          style={{
                            color: estaSeleccionadoEnOtra && !esSeleccionActual ? '#999' : 'inherit',
                            fontStyle: estaSeleccionadoEnOtra && !esSeleccionActual ? 'italic' : 'normal'
                          }}
                        >
                          {i.nombre} {estaSeleccionadoEnOtra && !esSeleccionActual ? '(ya seleccionado)' : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div className="w-24">
                  <NumberInput
                    placeholder="Cantidad"
                    value={insumo.cantidad}
                    onChange={(value) => updateInsumo(index, 'cantidad', value)}
                    required
                    disabled={isSubmitting}
                    className="w-full px-2 py-1.5 text-sm"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeInsumo(index)}
                  className="p-1.5 text-red-500 hover:bg-red-100 rounded-md transition-colors disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  <FaTrash size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </FormModal>
  );
};

export default ProductoEditModal; 
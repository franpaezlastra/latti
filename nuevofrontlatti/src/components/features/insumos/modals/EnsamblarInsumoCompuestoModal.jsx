import React, { useState, useEffect } from 'react';
import { FaHammer, FaInfoCircle, FaExclamationTriangle } from 'react-icons/fa';
import FormModal from '../../../ui/FormModal';
import Input from '../../../ui/Input';
import NumberInput from '../../../ui/NumberInput';

const EnsamblarInsumoCompuestoModal = ({ isOpen, onClose, onSubmit, insumoCompuesto }) => {
  const [formData, setFormData] = useState({
    cantidad: '',
    fecha: '',
    descripcion: ''
  });
  const [error, setError] = useState(false);
  const [textoError, setTextoError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validacionStock, setValidacionStock] = useState(null);

  // Inicializar formulario cuando se abre el modal
  useEffect(() => {
    if (isOpen && insumoCompuesto) {
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        cantidad: '',
        fecha: today,
        descripcion: `Ensamblar ${insumoCompuesto.nombre}`
      });
      setError(false);
      setTextoError('');
      setValidacionStock(null);
    }
  }, [isOpen, insumoCompuesto]);

  // Validar stock cuando cambia la cantidad
  useEffect(() => {
    if (formData.cantidad && insumoCompuesto && insumoCompuesto.receta) {
      validarStockSuficiente();
    }
  }, [formData.cantidad, insumoCompuesto]);

  const validarStockSuficiente = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `https://api.lattituc.site/api/insumo-compuesto/${insumoCompuesto.id}/validar-stock?cantidad=${formData.cantidad}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        setValidacionStock({ valido: true });
      } else {
        const errorData = await response.json();
        setValidacionStock({ valido: false, mensaje: errorData.error || 'Stock insuficiente' });
      }
    } catch (error) {
      console.error('Error validando stock:', error);
      setValidacionStock({ valido: false, mensaje: 'Error al validar stock' });
    }
  };

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

    if (validacionStock && !validacionStock.valido) {
      setError(true);
      setTextoError(validacionStock.mensaje);
      setIsSubmitting(false);
      return;
    }

    const ensambleData = {
      cantidad: parseFloat(formData.cantidad),
      fecha: formData.fecha,
      descripcion: formData.descripcion.trim()
    };

    try {
      const result = await onSubmit(insumoCompuesto.id, ensambleData);
      if (result && result.error) {
        setError(true);
        setTextoError(result.error);
      } else {
        handleClose();
      }
    } catch (error) {
      setError(true);
      setTextoError('Error inesperado al ensamblar insumo');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({ cantidad: '', fecha: '', descripcion: '' });
    setError(false);
    setTextoError('');
    setValidacionStock(null);
    setIsSubmitting(false);
    onClose();
  };

  if (!isOpen || !insumoCompuesto) return null;

  return (
    <FormModal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Ensamblar ${insumoCompuesto.nombre}`}
      onSubmit={handleSubmit}
      submitText="Ensamblar"
      isSubmitting={isSubmitting}
      error={error}
      errorMessage={textoError}
      maxWidth="max-w-2xl"
    >
      {/* Información del insumo compuesto */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <FaHammer className="text-purple-600 text-xl mt-1" />
          <div className="flex-1">
            <h3 className="text-purple-800 font-medium text-lg">
              {insumoCompuesto.nombre}
            </h3>
            <p className="text-sm text-purple-700 mt-1">
              Insumo compuesto que se ensambla con otros componentes
            </p>
            
            {/* Mostrar receta */}
            {insumoCompuesto.receta && insumoCompuesto.receta.length > 0 && (
              <div className="mt-3">
                <p className="text-sm font-medium text-purple-800 mb-2">Receta:</p>
                <div className="space-y-1">
                  {insumoCompuesto.receta.map((componente, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-purple-700">
                      <span className="w-6 h-6 bg-purple-200 rounded-full flex items-center justify-center text-xs font-medium">
                        {componente.cantidad}
                      </span>
                      <span>{componente.nombreInsumoBase}</span>
                      <span className="text-purple-500">
                        ({componente.unidadMedida})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Formulario de ensamble */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cantidad a Ensamblar *
          </label>
          <NumberInput
            placeholder="0"
            value={formData.cantidad}
            onChange={(value) => handleInputChange('cantidad', value)}
            required
            disabled={isSubmitting}
            className="w-full"
          />
          <p className="text-xs text-gray-500 mt-1">
            Cuántas unidades de {insumoCompuesto.nombre} quieres ensamblar
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fecha *
          </label>
          <Input
            type="date"
            value={formData.fecha}
            onChange={(e) => handleInputChange('fecha', e.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Descripción
        </label>
        <Input
          type="text"
          placeholder="Ej: Ensamblaje realizado por Juan"
          value={formData.descripcion}
          onChange={(e) => handleInputChange('descripcion', e.target.value)}
          disabled={isSubmitting}
        />
      </div>

      {/* Validación de stock */}
      {formData.cantidad && validacionStock && (
        <div className={`p-3 rounded-lg border mb-6 ${
          validacionStock.valido 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center gap-2">
            {validacionStock.valido ? (
              <FaInfoCircle className="text-green-600" size={16} />
            ) : (
              <FaExclamationTriangle className="text-red-600" size={16} />
            )}
            <p className={`text-sm font-medium ${
              validacionStock.valido ? 'text-green-800' : 'text-red-800'
            }`}>
              {validacionStock.valido 
                ? `✅ Stock suficiente para ensamblar ${formData.cantidad} unidades`
                : `❌ ${validacionStock.mensaje}`
              }
            </p>
          </div>
        </div>
      )}

      {/* Información sobre el proceso */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <FaInfoCircle className="text-blue-600 mt-0.5" size={14} />
          <div className="text-sm text-blue-700">
            <p className="font-medium">¿Qué sucederá al ensamblar?</p>
            <ul className="mt-1 space-y-1 text-xs">
              <li>• Se descontará la cantidad necesaria de cada componente</li>
              <li>• Se sumará {formData.cantidad || 'X'} unidades de {insumoCompuesto.nombre}</li>
              <li>• Se calculará automáticamente el precio por unidad</li>
              <li>• Se registrará el movimiento en el historial</li>
            </ul>
          </div>
        </div>
      </div>
    </FormModal>
  );
};

export default EnsamblarInsumoCompuestoModal;

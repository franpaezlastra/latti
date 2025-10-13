import React, { useState, useEffect } from "react";
import { FaTimes, FaExclamationTriangle, FaCheckCircle } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { loadInsumos } from "../../../../store/actions/insumoActions";
import { loadMovimientosInsumo } from "../../../../store/actions/movimientoInsumoActions";
import Button from "../../../ui/Button";
import Input from "../../../ui/Input";
import LoadingSpinner from "../../../ui/LoadingSpinner";

const EditarMovimientoInsumoModal = ({ isOpen, onClose, movimiento, onSuccess }) => {
  const dispatch = useDispatch();
  const insumos = useSelector((state) => state.insumos.insumos);
  const [loading, setLoading] = useState(false);
  const [validando, setValidando] = useState(false);
  const [validacion, setValidacion] = useState(null);
  const [error, setError] = useState("");
  const [cargandoInsumos, setCargandoInsumos] = useState(false);

  // Estados del formulario
  const [fecha, setFecha] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [tipoMovimiento, setTipoMovimiento] = useState("ENTRADA");
  const [detalles, setDetalles] = useState([]);

  // Inicializar formulario cuando se abre el modal
  useEffect(() => {
    if (isOpen && movimiento) {
      setFecha(movimiento.fecha.toISOString().split('T')[0]);
      setDescripcion(movimiento.descripcion || "");
      setTipoMovimiento(movimiento.tipoMovimiento);
      
      // Convertir detalles del movimiento a formato del formulario
      // Los detalles vienen como 'detalles' en el movimiento unificado
      console.log('🔍 Movimiento recibido:', movimiento);
      console.log('📦 Detalles del movimiento:', movimiento.detalles);
      
      const detallesDelMovimiento = movimiento.detalles || [];
      const detallesFormateados = detallesDelMovimiento.map(detalle => ({
        insumoId: detalle.id || detalle.insumoId,
        cantidad: detalle.cantidad,
        precio: detalle.precioTotal || 0,
        nombreInsumo: detalle.nombre || detalle.nombreInsumo
      }));
      
      console.log('✅ Detalles formateados:', detallesFormateados);
      setDetalles(detallesFormateados);
      
      // Validar si se puede editar
      validarEdicion();
    }
  }, [isOpen, movimiento]);

  // Cargar insumos al abrir el modal
  useEffect(() => {
    if (isOpen) {
      // Cargar insumos si están vacíos
      if (!insumos || insumos.length === 0) {
        console.log('Cargando insumos...');
        setCargandoInsumos(true);
        dispatch(loadInsumos()).finally(() => {
          setCargandoInsumos(false);
        });
      }
    }
  }, [isOpen, dispatch]);

  const validarEdicion = async () => {
    if (!movimiento) return;
    
    setValidando(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://api.lattituc.site/api/movimiento-insumo/${movimiento.id}/validar-edicion`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('No tienes permisos para editar este movimiento');
        } else if (response.status === 401) {
          throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente');
        } else {
          throw new Error(`Error del servidor: ${response.status}`);
        }
      }
      
      const data = await response.json();
      setValidacion(data);
    } catch (error) {
      console.error("Error al validar edición:", error);
      setValidacion({
        puedeEditar: false,
        razon: error.message || "Error al validar edición",
        detallesValidacion: [error.message || "Error de conexión"]
      });
    } finally {
      setValidando(false);
    }
  };

  const handleAgregarDetalle = () => {
    setDetalles([...detalles, { insumoId: "", cantidad: 0, precio: 0, nombreInsumo: "" }]);
  };

  const handleEliminarDetalle = (index) => {
    setDetalles(detalles.filter((_, i) => i !== index));
  };

  const handleDetalleChange = (index, field, value) => {
    const nuevosDetalles = [...detalles];
    nuevosDetalles[index] = { ...nuevosDetalles[index], [field]: value };
    
    // Si cambió el insumo, actualizar el nombre
    if (field === "insumoId") {
      const insumo = insumos.find(i => i.id === parseInt(value));
      if (insumo) {
        nuevosDetalles[index].nombreInsumo = insumo.nombre;
      }
    }
    
    setDetalles(nuevosDetalles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validacion?.puedeEditar) {
      setError("No se puede editar este movimiento debido a las validaciones de negocio");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Logs detallados para depuración
      console.log('🔍 === INICIO DE EDICIÓN ===');
      console.log('📦 Movimiento original:', movimiento);
      console.log('📝 Datos del formulario:');
      console.log('  - Fecha:', fecha);
      console.log('  - Descripción:', descripcion);
      console.log('  - Tipo:', tipoMovimiento);
      console.log('  - Detalles:', detalles);

      const movimientoData = {
        id: movimiento.id,
        fecha,
        descripcion,
        tipoMovimiento,
        detalles: detalles.map(detalle => ({
          insumoId: parseInt(detalle.insumoId),
          cantidad: parseFloat(detalle.cantidad),
          precio: parseFloat(detalle.precio)
        }))
      };

      console.log('📤 Objeto que se envía al backend:', movimientoData);
      console.log('🔢 Detalles mapeados:', movimientoData.detalles);

      const token = localStorage.getItem('token');
      console.log('🔑 Token de autenticación:', token ? 'Presente' : 'Ausente');
      
      const response = await fetch(`https://api.lattituc.site/api/movimiento-insumo/${movimiento.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(movimientoData)
      });

      console.log('📡 Respuesta del servidor:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Error del servidor:', errorData);
        throw new Error(errorData.error || 'Error al editar el movimiento');
      }

      const responseData = await response.json();
      console.log('✅ Respuesta exitosa:', responseData);

      // Recargar movimientos
      console.log('🔄 Recargando movimientos...');
      await dispatch(loadMovimientosInsumo());
      
      console.log('🎉 Edición completada exitosamente');
      onSuccess();
      onClose();
    } catch (error) {
      console.error("💥 Error al editar movimiento:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            Editar Movimiento de Insumo
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Validación de edición */}
        {validando && (
          <div className="p-4 bg-blue-50 border-b">
            <div className="flex items-center space-x-2">
              <LoadingSpinner size="sm" />
              <span className="text-blue-700">Validando si se puede editar...</span>
            </div>
          </div>
        )}

        {/* Carga de insumos */}
        {cargandoInsumos && (
          <div className="p-4 bg-yellow-50 border-b">
            <div className="flex items-center space-x-2">
              <LoadingSpinner size="sm" />
              <span className="text-yellow-700">Cargando insumos...</span>
            </div>
          </div>
        )}

        {validacion && !validando && (
          <div className={`p-4 border-b ${validacion.puedeEditar ? 'bg-green-50' : 'bg-red-50'}`}>
            <div className="flex items-start space-x-2">
              {validacion.puedeEditar ? (
                <FaCheckCircle className="text-green-500 mt-1" size={16} />
              ) : (
                <FaExclamationTriangle className="text-red-500 mt-1" size={16} />
              )}
              <div>
                <p className={`font-medium ${validacion.puedeEditar ? 'text-green-700' : 'text-red-700'}`}>
                  {validacion.razon}
                </p>
                {validacion.detallesValidacion && validacion.detallesValidacion.length > 0 && (
                  <ul className="mt-2 text-sm text-red-600">
                    {validacion.detallesValidacion.map((detalle, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>{detalle}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Datos básicos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha *
              </label>
              <Input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                required
                disabled={!validacion?.puedeEditar}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Movimiento *
              </label>
              <select
                value={tipoMovimiento}
                onChange={(e) => setTipoMovimiento(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={!validacion?.puedeEditar}
              >
                <option value="ENTRADA">Entrada</option>
                <option value="SALIDA">Salida</option>
              </select>
            </div>
            
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <Input
                type="text"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Descripción del movimiento"
                disabled={!validacion?.puedeEditar}
              />
            </div>
          </div>

          {/* Detalles */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-800">Detalles del Movimiento</h3>
              {validacion?.puedeEditar && (
                <Button
                  type="button"
                  onClick={handleAgregarDetalle}
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  Agregar Insumo
                </Button>
              )}
            </div>

            {detalles.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No hay insumos agregados
              </p>
            ) : (
              <div className="space-y-4">
                {detalles.map((detalle, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-700">
                        Insumo {index + 1}
                      </h4>
                      {validacion?.puedeEditar && (
                        <button
                          type="button"
                          onClick={() => handleEliminarDetalle(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <FaTimes size={14} />
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Insumo *
                        </label>
                        <select
                          value={detalle.insumoId}
                          onChange={(e) => handleDetalleChange(index, "insumoId", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                          disabled={!validacion?.puedeEditar || cargandoInsumos}
                        >
                          <option value="">
                            {cargandoInsumos ? "Cargando insumos..." : "Seleccionar insumo"}
                          </option>
                          {insumos && insumos.length > 0 ? (
                            insumos.map((insumo) => (
                              <option key={insumo.id} value={insumo.id}>
                                {insumo.nombre} ({insumo.unidadMedida})
                              </option>
                            ))
                          ) : (
                            !cargandoInsumos && (
                              <option value="" disabled>
                                No hay insumos disponibles
                              </option>
                            )
                          )}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Cantidad *
                          {detalle.insumoId && (() => {
                            const insumoSeleccionado = insumos.find(i => i.id === parseInt(detalle.insumoId));
                            return insumoSeleccionado ? ` (${insumoSeleccionado.unidadMedida})` : '';
                          })()}
                        </label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={detalle.cantidad}
                          onChange={(e) => handleDetalleChange(index, "cantidad", e.target.value)}
                          placeholder="0.00"
                          required
                          disabled={!validacion?.puedeEditar}
                        />
                      </div>
                      
                      {tipoMovimiento === "ENTRADA" && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Precio Total *
                          </label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={detalle.precio}
                            onChange={(e) => handleDetalleChange(index, "precio", e.target.value)}
                            placeholder="0.00"
                            required
                            disabled={!validacion?.puedeEditar}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Botones */}
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              onClick={onClose}
              className="bg-gray-300 text-gray-700 hover:bg-gray-400"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!validacion?.puedeEditar || loading}
              className="bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditarMovimientoInsumoModal;

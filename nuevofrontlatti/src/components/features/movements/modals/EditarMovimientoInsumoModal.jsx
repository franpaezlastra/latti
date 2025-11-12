import React, { useState, useEffect } from "react";
import { FaTimes, FaExclamationTriangle, FaCheckCircle, FaBox, FaCog } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { loadInsumos } from "../../../../store/actions/insumoActions";
import { 
  loadMovimientosInsumo, 
  validarEdicionMovimiento, 
  updateMovimientoInsumo 
} from "../../../../store/actions/movimientoInsumoActions";
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
  
  // ✅ NUEVO: Detectar si es un movimiento de ensamble
  const esMovimientoEnsamble = React.useMemo(() => {
    if (!movimiento || !movimiento.detalles) return false;
    // Un movimiento es de ensamble si alguno de sus detalles tiene ensambleId
    return movimiento.detalles.some(detalle => 
      detalle.ensambleId != null && detalle.ensambleId.trim() !== ''
    );
  }, [movimiento]);
  
  // ✅ NUEVO: Obtener el insumo compuesto del ensamble (si existe)
  const insumoCompuestoEnsamble = React.useMemo(() => {
    if (!esMovimientoEnsamble || !movimiento || !movimiento.detalles) return null;
    
    // Buscar el detalle que tenga ensambleId y sea ENTRADA (el insumo compuesto)
    const detalleEnsamble = movimiento.detalles.find(detalle => 
      detalle.ensambleId != null && detalle.ensambleId.trim() !== '' &&
      movimiento.tipoMovimiento === 'ENTRADA'
    );
    
    if (!detalleEnsamble) return null;
    
    // Buscar el insumo en la lista de insumos
    const insumoId = detalleEnsamble.insumoId || detalleEnsamble.id || detalleEnsamble.insumo?.id;
    if (!insumoId) return null;
    
    return insumos && insumos.length > 0 ? insumos.find(i => i.id === parseInt(insumoId)) : null;
  }, [esMovimientoEnsamble, movimiento, insumos]);

  // Inicializar formulario cuando se abre el modal
  useEffect(() => {
    if (isOpen && movimiento) {
      // Manejar la fecha (puede venir como Date, string o LocalDate)
      let fechaFormateada = '';
      if (movimiento.fecha) {
        if (movimiento.fecha instanceof Date) {
          fechaFormateada = movimiento.fecha.toISOString().split('T')[0];
        } else if (typeof movimiento.fecha === 'string') {
          // Si viene como string, intentar parsearla
          const fechaDate = new Date(movimiento.fecha);
          if (!isNaN(fechaDate.getTime())) {
            fechaFormateada = fechaDate.toISOString().split('T')[0];
          } else {
            // Si ya está en formato YYYY-MM-DD, usarla directamente
            fechaFormateada = movimiento.fecha.split('T')[0];
          }
        }
      }
      
      setFecha(fechaFormateada);
      setDescripcion(movimiento.descripcion || "");
      setTipoMovimiento(movimiento.tipoMovimiento || 'ENTRADA');
      
      // Convertir detalles del movimiento a formato del formulario
      // Los detalles vienen como 'detalles' o 'insumos' en el movimiento unificado
      console.log('🔍 Movimiento recibido:', movimiento);
      console.log('📦 Detalles del movimiento:', movimiento.detalles);
      console.log('📦 Insumos del movimiento:', movimiento.insumos);
      
      // Usar SOLO detalles o insumos, nunca ambos para evitar duplicados
      const detallesDelMovimiento = movimiento.detalles || movimiento.insumos || [];
      
      // Filtrar duplicados por insumoId antes de formatear
      const detallesSinDuplicados = detallesDelMovimiento.filter((detalle, index, self) => {
        const insumoId = detalle.insumoId || detalle.id || detalle.insumo?.id;
        return index === self.findIndex(d => 
          (d.insumoId || d.id || d.insumo?.id) === insumoId
        );
      });
      
      const detallesFormateados = detallesSinDuplicados.map(detalle => ({
        insumoId: String(detalle.id || detalle.insumoId || detalle.insumo?.id || ''),
        cantidad: detalle.cantidad || 0,
        precio: detalle.precio || detalle.precioTotal || 0,
        nombreInsumo: detalle.nombre || detalle.nombreInsumo || detalle.insumo?.nombre || ''
      }));
      
      console.log('✅ Detalles formateados (sin duplicados):', detallesFormateados);
      console.log('📊 Cantidad de detalles originales:', detallesDelMovimiento.length);
      console.log('📊 Cantidad de detalles sin duplicados:', detallesSinDuplicados.length);
      setDetalles(detallesFormateados);
    }
  }, [isOpen, movimiento]);

  // Validar edición cuando el movimiento cambie y tenga ID
  useEffect(() => {
    if (isOpen && movimiento?.id) {
      const validar = async () => {
        if (!movimiento?.id) return;
        
        setValidando(true);
        try {
          console.log('🔍 Validando edición para movimiento ID:', movimiento.id);
          const data = await dispatch(validarEdicionMovimiento(movimiento.id)).unwrap();
          console.log('✅ Validación completada:', data);
          setValidacion(data);
        } catch (error) {
          console.error("❌ Error al validar edición:", error);
          setValidacion({
            puedeEditar: false,
            razon: error || "Error al validar edición",
            detallesValidacion: [error || "Error de conexión"]
          });
        } finally {
          setValidando(false);
        }
      };
      
      validar();
    }
  }, [isOpen, movimiento?.id, dispatch]);

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
    if (!movimiento?.id) {
      console.warn('⚠️ No se puede validar edición: movimiento sin ID');
      return;
    }
    
    setValidando(true);
    try {
      console.log('🔍 Validando edición para movimiento ID:', movimiento.id);
      const data = await dispatch(validarEdicionMovimiento(movimiento.id)).unwrap();
      console.log('✅ Validación completada:', data);
      setValidacion(data);
    } catch (error) {
      console.error("❌ Error al validar edición:", error);
      setValidacion({
        puedeEditar: false,
        razon: error || "Error al validar edición",
        detallesValidacion: [error || "Error de conexión"]
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

      // Asegurar que la fecha esté en formato ISO (YYYY-MM-DD) para LocalDate
      let fechaFormateada = fecha;
      if (fecha) {
        // Si es un objeto Date, convertir a ISO string
        if (fecha instanceof Date) {
          fechaFormateada = fecha.toISOString().split('T')[0];
        } else if (typeof fecha === 'string') {
          // Si ya es string, asegurar que esté en formato YYYY-MM-DD
          const fechaDate = new Date(fecha);
          if (!isNaN(fechaDate.getTime())) {
            fechaFormateada = fechaDate.toISOString().split('T')[0];
          }
        }
      }

      // Filtrar detalles duplicados por insumoId antes de enviar
      const detallesUnicos = detalles.filter((detalle, index, self) => 
        index === self.findIndex(d => parseInt(d.insumoId) === parseInt(detalle.insumoId))
      );

      const movimientoData = {
        id: parseInt(movimiento.id), // Asegurar que sea número para Long
        fecha: fechaFormateada,
        descripcion: descripcion || '',
        tipoMovimiento: tipoMovimiento,
        detalles: detallesUnicos.map(detalle => ({
          insumoId: parseInt(detalle.insumoId), // Asegurar que sea Long
          cantidad: parseFloat(detalle.cantidad) || 0,
          precio: parseFloat(detalle.precio) || 0
        }))
      };

      // Logs detallados: objeto viejo vs objeto nuevo
      console.log('═══════════════════════════════════════════════════════════');
      console.log('📊 === COMPARACIÓN: OBJETO VIEJO vs OBJETO NUEVO ===');
      console.log('═══════════════════════════════════════════════════════════');
      
      console.log('📦 OBJETO VIEJO (Movimiento Original):');
      console.log(JSON.stringify({
        id: movimiento.id,
        fecha: movimiento.fecha,
        descripcion: movimiento.descripcion,
        tipoMovimiento: movimiento.tipoMovimiento,
        detalles: (movimiento.detalles || movimiento.insumos || []).map(det => ({
          id: det.id || det.insumoId,
          insumoId: det.insumoId || det.id || det.insumo?.id,
          cantidad: det.cantidad,
          precio: det.precio || det.precioTotal,
          nombreInsumo: det.nombre || det.nombreInsumo || det.insumo?.nombre
        }))
      }, null, 2));
      
      console.log('📦 OBJETO NUEVO (A enviar en PUT):');
      console.log(JSON.stringify(movimientoData, null, 2));
      
      console.log('📊 RESUMEN:');
      console.log('  - ID del movimiento:', movimientoData.id);
      console.log('  - Fecha vieja:', movimiento.fecha);
      console.log('  - Fecha nueva:', movimientoData.fecha);
      console.log('  - Descripción vieja:', movimiento.descripcion);
      console.log('  - Descripción nueva:', movimientoData.descripcion);
      console.log('  - Tipo viejo:', movimiento.tipoMovimiento);
      console.log('  - Tipo nuevo:', movimientoData.tipoMovimiento);
      console.log('  - Cantidad detalles viejos:', (movimiento.detalles || movimiento.insumos || []).length);
      console.log('  - Cantidad detalles nuevos:', movimientoData.detalles.length);
      console.log('  - Detalles ANTES de filtrar duplicados:', detalles.length);
      console.log('  - Detalles DESPUÉS de filtrar duplicados:', detallesUnicos.length);
      
      console.log('📋 DETALLES VIEJOS:');
      (movimiento.detalles || movimiento.insumos || []).forEach((det, index) => {
        console.log(`  [${index}] insumoId: ${det.insumoId || det.id || det.insumo?.id}, cantidad: ${det.cantidad}, precio: ${det.precio || det.precioTotal}`);
      });
      
      console.log('📋 DETALLES NUEVOS:');
      movimientoData.detalles.forEach((det, index) => {
        console.log(`  [${index}] insumoId: ${det.insumoId}, cantidad: ${det.cantidad}, precio: ${det.precio}`);
      });
      
      console.log('═══════════════════════════════════════════════════════════');

      // Usar la acción Redux en lugar de fetch directo
      const responseData = await dispatch(updateMovimientoInsumo(movimientoData)).unwrap();
      console.log('✅ Respuesta exitosa:', responseData);

      // Recargar movimientos para actualizar la lista
      console.log('🔄 Recargando movimientos después de editar...');
      await dispatch(loadMovimientosInsumo());
      
      console.log('🎉 Edición completada exitosamente');
      
      // Llamar onSuccess antes de cerrar para que el componente padre sepa que todo salió bien
      if (onSuccess) {
      onSuccess();
      }
      
      // Cerrar el modal
      onClose();
    } catch (error) {
      console.error("💥 Error al editar movimiento:", error);
      setError(error || "Error al editar el movimiento");
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
                onChange={(e) => {
                  // ✅ CRÍTICO: No se puede cambiar el tipo de movimiento
                  if (e.target.value !== movimiento.tipoMovimiento) {
                    setError("No se puede cambiar el tipo de movimiento. El tipo debe permanecer igual.");
                    return;
                  }
                  setTipoMovimiento(e.target.value);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={!validacion?.puedeEditar || true} // ✅ Siempre deshabilitado (no se puede cambiar)
              >
                <option value="ENTRADA">Entrada</option>
                <option value="SALIDA">Salida</option>
              </select>
              {movimiento && (
                <p className="text-xs text-gray-500 mt-1">
                  El tipo de movimiento no puede ser modificado
                </p>
              )}
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
              <h3 className="text-lg font-medium text-gray-800">
                Detalles del Movimiento
                {esMovimientoEnsamble && (
                  <span className="ml-2 text-sm font-normal text-purple-600">
                    (Ensamble - Solo se puede editar cantidad)
                  </span>
                )}
              </h3>
              {validacion?.puedeEditar && !esMovimientoEnsamble && (
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
                      {validacion?.puedeEditar && !esMovimientoEnsamble && (
                        <button
                          type="button"
                          onClick={() => handleEliminarDetalle(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <FaTimes size={14} />
                        </button>
                      )}
                      {esMovimientoEnsamble && (
                        <span className="text-xs text-purple-600 font-medium">
                          Ensamble
                        </span>
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
                          disabled={!validacion?.puedeEditar || cargandoInsumos || esMovimientoEnsamble}
                        >
                          <option value="">
                            {cargandoInsumos ? "Cargando insumos..." : "Seleccionar insumo"}
                          </option>
                          {insumos && insumos.length > 0 ? (
                            (() => {
                              // ✅ CRÍTICO: Si es un movimiento de ensamble, mostrar solo el insumo compuesto específico
                              if (esMovimientoEnsamble && insumoCompuestoEnsamble) {
                                return (
                                  <option key={insumoCompuestoEnsamble.id} value={insumoCompuestoEnsamble.id}>
                                    {insumoCompuestoEnsamble.nombre} (Compuesto) ({insumoCompuestoEnsamble.unidadMedida})
                                  </option>
                                );
                              }
                              
                              // Si NO es ensamble, mostrar solo insumos BASE (como antes)
                              return insumos
                                .filter(i => i.tipo === 'BASE' || !i.tipo) // ✅ Solo insumos base o sin tipo (compatibilidad)
                                .map((insumo) => {
                                  const tipoTexto = insumo.tipo === 'COMPUESTO' ? ' (Compuesto)' : ' (Base)';
                                  return (
                                    <option key={insumo.id} value={insumo.id}>
                                      {insumo.nombre}{tipoTexto} ({insumo.unidadMedida})
                                    </option>
                                  );
                                });
                            })()
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

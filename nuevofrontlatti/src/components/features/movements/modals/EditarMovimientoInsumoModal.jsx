import React, { useState, useEffect } from "react";
import { FaPlus, FaTrash, FaCalendarAlt, FaBox, FaInfoCircle, FaCog } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { loadInsumos } from "../../../../store/actions/insumoActions";
import { 
  loadMovimientosInsumo, 
  validarEdicionMovimiento, 
  updateMovimientoInsumo 
} from "../../../../store/actions/movimientoInsumoActions";
import FormModal from "../../../ui/FormModal";
import Button from "../../../ui/Button";
import Input from "../../../ui/Input";
import NumberInput from "../../../ui/NumberInput";
import LoadingSpinner from "../../../ui/LoadingSpinner";

const EditarMovimientoInsumoModal = ({ isOpen, onClose, movimiento, onSuccess }) => {
  const dispatch = useDispatch();
  const insumos = useSelector((state) => state.insumos.insumos);
  const [loading, setLoading] = useState(false);
  const [validando, setValidando] = useState(false);
  const [validacion, setValidacion] = useState(null);
  const [error, setError] = useState(false);
  const [textoError, setTextoError] = useState("");
  const [cargandoInsumos, setCargandoInsumos] = useState(false);

  // Estados del formulario
  const [fecha, setFecha] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [tipoMovimiento, setTipoMovimiento] = useState("ENTRADA");
  const [detalles, setDetalles] = useState([]);
  const [esMovimientoEnsamble, setEsMovimientoEnsamble] = useState(false);

  // Inicializar formulario cuando se abre el modal
  useEffect(() => {
    if (isOpen && movimiento) {
      // Manejar la fecha (puede venir como Date, string o LocalDate)
      let fechaFormateada = '';
      if (movimiento.fecha) {
        if (movimiento.fecha instanceof Date) {
          fechaFormateada = movimiento.fecha.toISOString().split('T')[0];
        } else if (typeof movimiento.fecha === 'string') {
          const fechaDate = new Date(movimiento.fecha);
          if (!isNaN(fechaDate.getTime())) {
            fechaFormateada = fechaDate.toISOString().split('T')[0];
          } else {
            fechaFormateada = movimiento.fecha.split('T')[0];
          }
        }
      }
      
      setFecha(fechaFormateada);
      setDescripcion(movimiento.descripcion || "");
      setTipoMovimiento(movimiento.tipoMovimiento || 'ENTRADA');
      
      // Detectar si es un movimiento de ensamble
      const detallesDelMovimiento = movimiento.detalles || movimiento.insumos || [];
      const tieneEnsambleId = detallesDelMovimiento.some(detalle => 
        detalle.ensambleId && detalle.ensambleId.trim() !== ''
      );
      setEsMovimientoEnsamble(tieneEnsambleId);
      
      // Convertir detalles del movimiento a formato del formulario
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
      
      setDetalles(detallesFormateados);
      setError(false);
      setTextoError("");
    }
  }, [isOpen, movimiento]);

  // Validar edición cuando el movimiento cambie y tenga ID
  useEffect(() => {
    if (isOpen && movimiento?.id) {
      const validar = async () => {
        if (!movimiento?.id) return;
        
        setValidando(true);
        try {
          const data = await dispatch(validarEdicionMovimiento(movimiento.id)).unwrap();
          setValidacion(data);
        } catch (error) {
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
      if (!insumos || insumos.length === 0) {
        setCargandoInsumos(true);
        dispatch(loadInsumos()).finally(() => {
          setCargandoInsumos(false);
        });
      }
    }
  }, [isOpen, dispatch, insumos]);

  // Calcular precio automáticamente para movimientos de ensamble de insumos compuestos
  const calcularPrecioEnsamble = (insumoId, cantidad) => {
    if (!insumoId || !cantidad || cantidad <= 0) return 0;
    
    const insumo = insumos.find(i => i.id === parseInt(insumoId));
    if (!insumo || insumo.tipo !== 'COMPUESTO' || !insumo.receta) return 0;
    
    let precioTotal = 0;
    insumo.receta.forEach(componente => {
      const insumoBase = insumos.find(i => i.id === componente.insumoBaseId);
      if (insumoBase && insumoBase.precioDeCompra) {
        const cantidadNecesaria = componente.cantidad * cantidad;
        precioTotal += cantidadNecesaria * insumoBase.precioDeCompra;
      }
    });
    
    return precioTotal;
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
        
        // Si es un movimiento de ensamble de ENTRADA y el insumo es compuesto, calcular precio automáticamente
        if (esMovimientoEnsamble && tipoMovimiento === "ENTRADA" && insumo.tipo === 'COMPUESTO') {
          const cantidad = nuevosDetalles[index].cantidad || 0;
          const precioCalculado = calcularPrecioEnsamble(value, cantidad);
          nuevosDetalles[index].precio = precioCalculado;
        }
      }
    }
    
    // Si cambió la cantidad y es un movimiento de ensamble de ENTRADA con insumo compuesto, recalcular precio
    if (field === "cantidad" && esMovimientoEnsamble && tipoMovimiento === "ENTRADA") {
      const insumoId = nuevosDetalles[index].insumoId;
      const insumo = insumos.find(i => i.id === parseInt(insumoId));
      if (insumo && insumo.tipo === 'COMPUESTO') {
        const cantidad = parseFloat(value) || 0;
        const precioCalculado = calcularPrecioEnsamble(insumoId, cantidad);
        nuevosDetalles[index].precio = precioCalculado;
      }
    }
    
    setDetalles(nuevosDetalles);
    if (error) {
      setError(false);
      setTextoError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validacion?.puedeEditar) {
      setError(true);
      setTextoError("No se puede editar este movimiento debido a las validaciones de negocio");
      return;
    }

    setLoading(true);
    setError(false);
    setTextoError("");

    try {
      // Asegurar que la fecha esté en formato ISO (YYYY-MM-DD)
      let fechaFormateada = fecha;
      if (fecha) {
        if (fecha instanceof Date) {
          fechaFormateada = fecha.toISOString().split('T')[0];
        } else if (typeof fecha === 'string') {
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
        id: parseInt(movimiento.id),
        fecha: fechaFormateada,
        descripcion: descripcion || '',
        tipoMovimiento: tipoMovimiento,
        detalles: detallesUnicos.map(detalle => ({
          insumoId: parseInt(detalle.insumoId),
          cantidad: parseFloat(detalle.cantidad) || 0,
          precio: parseFloat(detalle.precio) || 0
        }))
      };

      await dispatch(updateMovimientoInsumo(movimientoData)).unwrap();
      await dispatch(loadMovimientosInsumo());
      
      if (onSuccess) {
        onSuccess();
      }
      
      onClose();
    } catch (error) {
      console.error("💥 Error al editar movimiento:", error);
      setError(true);
      setTextoError(error || "Error al editar el movimiento");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar Movimiento de Insumo"
      onSubmit={handleSubmit}
      submitText="Guardar Cambios"
      isSubmitting={loading}
      error={error}
      errorMessage={textoError}
      maxWidth="max-w-4xl"
    >
      {/* Validación de edición */}
      {validando && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-2">
            <LoadingSpinner size="sm" />
            <span className="text-blue-700 text-sm">Validando si se puede editar...</span>
          </div>
        </div>
      )}

      {/* Carga de insumos */}
      {cargandoInsumos && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-2">
            <LoadingSpinner size="sm" />
            <span className="text-yellow-700 text-sm">Cargando insumos...</span>
          </div>
        </div>
      )}

      {/* Resultado de validación */}
      {validacion && !validando && (
        <div className={`mb-4 p-4 rounded-lg border ${validacion.puedeEditar ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-start space-x-2">
            {validacion.puedeEditar ? (
              <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
            <div className="flex-1">
              <p className={`font-medium text-sm ${validacion.puedeEditar ? 'text-green-700' : 'text-red-700'}`}>
                {validacion.razon}
              </p>
              {validacion.detallesValidacion && validacion.detallesValidacion.length > 0 && (
                <ul className="mt-2 text-sm text-red-600 space-y-1">
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

      {/* Información de movimiento de ensamble */}
      {esMovimientoEnsamble && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
          <div className="flex items-start space-x-2">
            <FaCog className="text-purple-600 mt-0.5 flex-shrink-0" size={16} />
            <div className="flex-1">
              <p className="text-sm font-medium text-purple-800 mb-1">
                Movimiento de Ensamble
              </p>
              <p className="text-xs text-purple-700">
                {tipoMovimiento === "ENTRADA" 
                  ? "Este es un movimiento de ensamble. Al editar la cantidad, el precio se calculará automáticamente basado en los componentes de la receta. Los movimientos de salida relacionados se actualizarán proporcionalmente."
                  : "Este movimiento de salida está relacionado con un ensamble. Para editarlo, debes editar el movimiento de entrada de ensamble del insumo compuesto relacionado."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Datos básicos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fecha *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
              <FaCalendarAlt className="text-blue-500" size={16} />
            </div>
            <Input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="pl-10"
              required
              disabled={!validacion?.puedeEditar || loading}
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Movimiento *
          </label>
          <select
            value={tipoMovimiento}
            onChange={(e) => setTipoMovimiento(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            required
            disabled={!validacion?.puedeEditar || loading}
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
            disabled={!validacion?.puedeEditar || loading}
          />
        </div>
      </div>

      {/* Detalles */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FaBox className="text-blue-600" />
            Detalle de Insumos
          </h3>
          {validacion?.puedeEditar && (
            <Button
              type="button"
              onClick={handleAgregarDetalle}
              variant="outline"
              size="small"
              className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700"
              disabled={loading}
            >
              <FaPlus size={12} />
              Agregar Insumo
            </Button>
          )}
        </div>

        {detalles.length === 0 ? (
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
            <FaBox className="text-4xl text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-medium">No hay insumos agregados</p>
            <p className="text-xs mt-1">Haz clic en "Agregar Insumo" para comenzar</p>
          </div>
        ) : (
          <div className="space-y-4">
            {detalles.map((detalle, index) => {
              const insumoSeleccionado = insumos.find(i => i.id === parseInt(detalle.insumoId));
              const esInsumoCompuesto = insumoSeleccionado?.tipo === 'COMPUESTO';
              const mostrarInfoPrecio = esMovimientoEnsamble && tipoMovimiento === "ENTRADA" && esInsumoCompuesto;

              return (
                <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-700 flex items-center gap-2">
                      <FaBox className="text-blue-500" size={14} />
                      Insumo {index + 1}
                      {mostrarInfoPrecio && (
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                          Precio calculado automáticamente
                        </span>
                      )}
                    </h4>
                    {validacion?.puedeEditar && (
                      <button
                        type="button"
                        onClick={() => handleEliminarDetalle(index)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                        disabled={loading}
                      >
                        <FaTrash size={14} />
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        required
                        disabled={!validacion?.puedeEditar || cargandoInsumos || loading}
                      >
                        <option value="">
                          {cargandoInsumos ? "Cargando insumos..." : "Seleccionar insumo"}
                        </option>
                        {insumos && insumos.length > 0 ? (
                          insumos.map((insumo) => {
                            const tipoTexto = insumo.tipo === 'COMPUESTO' ? ' (Compuesto)' : ' (Base)';
                            return (
                              <option key={insumo.id} value={insumo.id}>
                                {insumo.nombre}{tipoTexto} ({insumo.unidadMedida})
                              </option>
                            );
                          })
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
                        {detalle.insumoId && insumoSeleccionado && (
                          <span className="text-gray-500 font-normal ml-1">
                            ({insumoSeleccionado.unidadMedida})
                          </span>
                        )}
                      </label>
                      <NumberInput
                        value={detalle.cantidad}
                        onChange={(value) => handleDetalleChange(index, "cantidad", value)}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        disabled={!validacion?.puedeEditar || loading}
                        required
                      />
                    </div>
                    
                    {tipoMovimiento === "ENTRADA" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Precio Total *
                          {mostrarInfoPrecio && (
                            <span className="text-xs text-purple-600 ml-1">
                              (auto)
                            </span>
                          )}
                        </label>
                        <NumberInput
                          value={detalle.precio}
                          onChange={(value) => handleDetalleChange(index, "precio", value)}
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                          disabled={mostrarInfoPrecio || !validacion?.puedeEditar || loading}
                          required
                        />
                        {mostrarInfoPrecio && (
                          <p className="text-xs text-purple-600 mt-1 flex items-center gap-1">
                            <FaInfoCircle size={10} />
                            Calculado según componentes de la receta
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </FormModal>
  );
};

export default EditarMovimientoInsumoModal;

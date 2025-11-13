import React, { useState, useEffect, useRef } from "react";
import { FaTimes, FaExclamationTriangle, FaCheckCircle, FaBox, FaHammer, FaInfoCircle } from "react-icons/fa";
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
import NumberInput from "../../../ui/NumberInput";
import RecetaInsumoDisplay from "../../insumos/components/RecetaInsumoDisplay";
import { formatDateToLocalString } from '../../../../utils/formatters';

const EditarMovimientoEnsambleModal = ({ isOpen, onClose, movimiento, onSuccess }) => {
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
  const [cantidad, setCantidad] = useState(0);
  const [insumoCompuesto, setInsumoCompuesto] = useState(null);
  const [ensambleId, setEnsambleId] = useState(null);
  const [precioOriginal, setPrecioOriginal] = useState(0);

  // Inicializar formulario cuando se abre el modal
  useEffect(() => {
    if (isOpen && movimiento) {
      // ✅ CORREGIDO: Manejar la fecha usando hora local para evitar problemas de zona horaria
      let fechaFormateada = '';
      if (movimiento.fecha) {
        fechaFormateada = formatDateToLocalString(movimiento.fecha);
      }
      
      setFecha(fechaFormateada);
      setDescripcion(movimiento.descripcion || "");
      
      // Buscar el detalle del insumo compuesto (ENTRADA con ensambleId)
      const detalleEnsamble = (movimiento.detalles || []).find(detalle => 
        detalle.ensambleId != null && detalle.ensambleId.trim() !== '' &&
        movimiento.tipoMovimiento === 'ENTRADA'
      );
      
      if (detalleEnsamble) {
        const insumoId = detalleEnsamble.insumoId || detalleEnsamble.id || detalleEnsamble.insumo?.id;
        setCantidad(detalleEnsamble.cantidad || 0);
        setEnsambleId(detalleEnsamble.ensambleId);
        // ✅ NUEVO: Guardar el precio original del movimiento
        setPrecioOriginal(detalleEnsamble.precio || detalleEnsamble.precioTotal || 0);
        
        // Buscar el insumo compuesto en la lista
        if (insumos && insumos.length > 0) {
          const insumo = insumos.find(i => i.id === parseInt(insumoId));
          setInsumoCompuesto(insumo);
        }
      }
    }
  }, [isOpen, movimiento, insumos]);

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
      if (!insumos || insumos.length === 0) {
        setCargandoInsumos(true);
        dispatch(loadInsumos()).finally(() => {
          setCargandoInsumos(false);
        });
      }
    }
  }, [isOpen, dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validacion?.puedeEditar) {
      setError("No se puede editar este movimiento debido a las validaciones de negocio");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Formatear fecha
      let fechaFormateada = fecha;
      if (fecha) {
        if (fecha instanceof Date) {
          // ✅ CORREGIDO: Usar formatDateToLocalString para evitar problemas de zona horaria
          fechaFormateada = formatDateToLocalString(fecha);
        } else if (typeof fecha === 'string') {
          fechaFormateada = formatDateToLocalString(fecha);
        }
      }

      // ✅ CRÍTICO: Calcular el precio basado en la receta del insumo compuesto
      // El precio se calcula sumando el costo de todos los componentes
      let precioCalculado = 0;
      
      if (insumoCompuesto && insumoCompuesto.receta && insumoCompuesto.receta.length > 0) {
        // Calcular precio basado en la receta
        precioCalculado = insumoCompuesto.receta.reduce((total, componente) => {
          const insumoBase = insumos.find(i => i.id === componente.insumoBaseId);
          if (insumoBase) {
            const cantidadNecesaria = componente.cantidad * cantidad;
            const costoComponente = cantidadNecesaria * (insumoBase.precioDeCompra || 0);
            return total + costoComponente;
          }
          return total;
        }, 0);
      } else if (precioOriginal > 0) {
        // Si no hay receta disponible, usar el precio original y ajustarlo proporcionalmente
        const cantidadOriginal = movimiento.detalles?.find(d => 
          d.ensambleId === ensambleId && movimiento.tipoMovimiento === 'ENTRADA'
        )?.cantidad || cantidad;
        
        if (cantidadOriginal > 0) {
          const precioPorUnidad = precioOriginal / cantidadOriginal;
          precioCalculado = precioPorUnidad * cantidad;
        } else {
          precioCalculado = precioOriginal;
        }
      } else {
        // Fallback: usar el precio de compra del insumo compuesto
        precioCalculado = (insumoCompuesto?.precioDeCompra || 0) * cantidad;
      }

      // Preparar datos para el backend
      // El backend espera un movimiento con detalles que incluyan el insumo compuesto
      const movimientoData = {
        id: parseInt(movimiento.id),
        fecha: fechaFormateada,
        descripcion: descripcion || '',
        tipoMovimiento: 'ENTRADA', // Los ensambles siempre son ENTRADA
        detalles: [{
          insumoId: parseInt(insumoCompuesto.id),
          cantidad: parseFloat(cantidad) || 0,
          precio: precioCalculado // ✅ Precio calculado basado en componentes o proporcional
        }]
      };

      console.log('🔧 Editando movimiento de ensamble:', movimientoData);

      const responseData = await dispatch(updateMovimientoInsumo(movimientoData)).unwrap();
      console.log('✅ Respuesta exitosa:', responseData);

      // Recargar movimientos
      await dispatch(loadMovimientosInsumo());
      
      if (onSuccess) {
        onSuccess();
      }
      
      onClose();
    } catch (error) {
      console.error("💥 Error al editar movimiento de ensamble:", error);
      setError(error || "Error al editar el movimiento de ensamble");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-purple-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <FaHammer className="text-purple-600" size={24} />
            <h2 className="text-xl font-semibold text-gray-800">
              Editar Movimiento de Ensamble
            </h2>
          </div>
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
          {/* Información sobre ensamble */}
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 mb-6 border border-purple-200">
            <div className="flex items-start gap-2">
              <FaInfoCircle className="text-purple-600 mt-0.5" size={16} />
              <div className="text-sm text-purple-800">
                <p className="font-medium mb-1">⚠️ Edición de Ensamble</p>
                <p className="text-xs">
                  Al editar la cantidad, los insumos base se ajustarán automáticamente de forma proporcional.
                  No se puede cambiar el insumo compuesto ni los componentes del ensamble.
                </p>
              </div>
            </div>
          </div>

          {/* Datos básicos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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
                Descripción
              </label>
              <Input
                type="text"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Descripción del ensamble"
                disabled={!validacion?.puedeEditar}
              />
            </div>
          </div>

          {/* Insumo Compuesto (solo lectura) */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Insumo Compuesto *
            </label>
            <div className="bg-gray-50 border border-gray-300 rounded-md p-3">
              {insumoCompuesto ? (
                <div className="flex items-center gap-2">
                  <FaBox className="text-purple-600" />
                  <span className="font-medium text-gray-800">
                    {insumoCompuesto.nombre} (Compuesto)
                  </span>
                  <span className="text-sm text-gray-500">
                    ({insumoCompuesto.unidadMedida})
                  </span>
                </div>
              ) : (
                <span className="text-gray-500">Cargando insumo...</span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              El insumo compuesto no puede ser modificado
            </p>
          </div>

          {/* Cantidad */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cantidad a Ensamblar *
              {insumoCompuesto && (
                <span className="text-gray-500 font-normal ml-2">
                  ({insumoCompuesto.unidadMedida})
                </span>
              )}
            </label>
            <NumberInput
              value={cantidad}
              onChange={(value) => setCantidad(value)}
              placeholder="0"
              min="0"
              step="0.01"
              disabled={!validacion?.puedeEditar}
              required
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              Los componentes se ajustarán automáticamente de forma proporcional
            </p>
          </div>

          {/* Mostrar receta del insumo compuesto */}
          {insumoCompuesto && insumoCompuesto.receta && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Componentes del Ensamble
              </h3>
              <RecetaInsumoDisplay receta={insumoCompuesto.receta} />
            </div>
          )}

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
              className="bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditarMovimientoEnsambleModal;


package com.Latti.stock.service.impl;

import com.Latti.stock.dtos.CrearMovimientoDeInsumoDTO;
import com.Latti.stock.dtos.DetalleMovimientoInsumoDTO;
import com.Latti.stock.dtos.EditarMovimientoDeInsumoDTO;
import com.Latti.stock.dtos.ResponseDetalleMovimientoInsumoDTO;
import com.Latti.stock.dtos.ResponseMovimientosInsumoLoteDTO;
import com.Latti.stock.dtos.ValidacionEdicionDTO;
import com.Latti.stock.modules.DetalleMovimientoInsumo;
import com.Latti.stock.modules.Insumo;
import com.Latti.stock.modules.InsumoReceta;
import com.Latti.stock.modules.MovimientoInsumoLote;
import com.Latti.stock.modules.Producto;
import com.Latti.stock.modules.TipoMovimiento;
import com.Latti.stock.repositories.InsumoRepository;
import com.Latti.stock.repositories.MovimientoInsumoLoteRepository;
import com.Latti.stock.repositories.ProductoRepository;
import com.Latti.stock.repositories.DetalleMovimientoInsumoRepository;
import com.Latti.stock.service.MovimientoInsumoLoteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.ArrayList;
import java.util.Set;
import java.util.HashSet;
import java.util.Comparator;
import java.util.stream.Collectors;
import java.time.LocalDate;

@Service
public class MovimientoInsumoLoteServiceImplements implements MovimientoInsumoLoteService {
    @Autowired
    private InsumoRepository insumoRepository;

    @Autowired
    private MovimientoInsumoLoteRepository movimientoRepository;

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private DetalleMovimientoInsumoRepository detalleMovimientoInsumoRepository;

    @Override
    @Transactional
    public MovimientoInsumoLote crearMovimientoInsumo(CrearMovimientoDeInsumoDTO dto) {
        try {
            MovimientoInsumoLote movimiento = new MovimientoInsumoLote(
                    dto.fecha(),
                    dto.descripcion(),
                    dto.tipoMovimiento()
            );

            // Lista para almacenar los insumos que necesitan recalcular precio de inversión
            List<Long> insumosParaRecalcular = new ArrayList<>();

            for (DetalleMovimientoInsumoDTO d : dto.detalles()) {
                // Validar que el insumo existe
                Insumo insumo = insumoRepository.findById(d.insumoId())
                        .orElseThrow(() -> new IllegalArgumentException("Insumo no encontrado: " + d.insumoId()));

                // Validar cantidad positiva
                if (d.cantidad() <= 0) {
                    throw new IllegalArgumentException("La cantidad debe ser mayor a 0 para el insumo: " + insumo.getNombre());
                }

                // Validaciones específicas para SALIDA
                if (dto.tipoMovimiento() == TipoMovimiento.SALIDA) {
                    // Validar stock disponible en la fecha del movimiento
                    double stockDisponibleEnFecha = calcularStockDisponibleEnFecha(insumo, dto.fecha());
                    if (stockDisponibleEnFecha < d.cantidad()) {
                        throw new IllegalArgumentException(
                            "Stock insuficiente para el insumo '" + insumo.getNombre() + 
                            "' en la fecha " + dto.fecha() + 
                            ". Stock disponible en esa fecha: " + stockDisponibleEnFecha + 
                            ", Cantidad solicitada: " + d.cantidad()
                        );
                    }
                }

                // Validaciones específicas para ENTRADA
                if (dto.tipoMovimiento() == TipoMovimiento.ENTRADA) {
                    // Validar precio positivo
                    if (d.precio() <= 0) {
                        throw new IllegalArgumentException("El precio debe ser mayor a 0 para el insumo: " + insumo.getNombre());
                    }
                    
                    // Validar que el precio sea razonable (opcional - puedes ajustar el rango)
                    if (d.precio() > 1000000) { // 1 millón como límite máximo
                        throw new IllegalArgumentException("El precio parece ser demasiado alto para el insumo: " + insumo.getNombre());
                    }
                }

                if (dto.tipoMovimiento() == TipoMovimiento.ENTRADA) {
                    insumo.setStockActual(insumo.getStockActual() + d.cantidad());
                    
                    // ✅ LÓGICA CORREGIDA: Solo actualizar precio si el nuevo es mayor (peor)
                    double precioPorUnidad = d.precio() / d.cantidad();
                    double precioActual = insumo.getPrecioDeCompra();
                    
                    // Solo actualizar si:
                    // 1. No hay precio previo (primera compra)
                    // 2. El nuevo precio es mayor (peor) que el anterior
                    if (precioActual == 0 || precioPorUnidad > precioActual) {
                    insumo.setPrecioDeCompra(precioPorUnidad);
                        System.out.println("🔄 Precio actualizado para " + insumo.getNombre() + 
                                         ": $" + precioActual + " → $" + precioPorUnidad + " por " + insumo.getUnidadMedida());
                    } else {
                        System.out.println("✅ Manteniendo mejor precio para " + insumo.getNombre() + 
                                         ": $" + precioActual + " (nuevo: $" + precioPorUnidad + ")");
                    }
                    
                    // Agregar a la lista para recalcular después
                    insumosParaRecalcular.add(insumo.getId());
                } else {
                    insumo.setStockActual(insumo.getStockActual() - d.cantidad());
                }

                // Guardar el insumo actualizado
                insumoRepository.save(insumo);

                DetalleMovimientoInsumo detalle = new DetalleMovimientoInsumo(d.cantidad());
                detalle.setInsumo(insumo);
                
                // Guardar el precio total para movimientos de entrada
                if (dto.tipoMovimiento() == TipoMovimiento.ENTRADA) {
                    detalle.setPrecioTotal(d.precio());
                }
                
                movimiento.addDetalle(detalle);
            }

            // Guardar el movimiento primero
            MovimientoInsumoLote movimientoGuardado = movimientoRepository.save(movimiento);

            // Recalcular precio de inversión de productos después de guardar todo
            for (Long insumoId : insumosParaRecalcular) {
                recalcularPrecioInversionProductos(insumoId);
            }

            return movimientoGuardado;
        } catch (Exception e) {
            System.err.println("Error en crearMovimientoInsumo: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }


    @Override
    public List<ResponseMovimientosInsumoLoteDTO> obtenerMovimientosDTO() {
        return movimientoRepository.findAll().stream()
                .map(mov -> new ResponseMovimientosInsumoLoteDTO(
                        mov.getId(),
                        mov.getFecha(),
                        mov.getDescripcion(),
                        mov.getTipoMovimiento(),
                        mov.getDetalles().stream()
                                .map(det -> new ResponseDetalleMovimientoInsumoDTO(
                                        det.getInsumo().getId(),
                                        det.getInsumo().getNombre(),
                                        det.getCantidad(),
                                        det.getInsumo().getUnidadMedida(),
                                        det.getInsumo().getPrecioDeCompra(),
                                        det.getPrecioTotal()
                                ))
                                .toList()
                ))
                .toList();
    }

    @Override
    @Transactional
    public MovimientoInsumoLote eliminarMovimientoInsumo(Long id) {
        MovimientoInsumoLote movimiento = movimientoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Movimiento no encontrado"));

        // Lista para recalcular productos después de eliminar
        Set<Long> insumosParaRecalcular = new HashSet<>();

        // Revertir cambios en cada insumo
        for (DetalleMovimientoInsumo detalle : movimiento.getDetalles()) {
            Insumo insumo = detalle.getInsumo();
            
            if (movimiento.getTipoMovimiento() == TipoMovimiento.ENTRADA) {
                // Para entrada: restar cantidad del stock
                if (insumo.getStockActual() < detalle.getCantidad()) {
                    throw new IllegalArgumentException("No se puede eliminar el movimiento. Stock insuficiente para revertir: " + insumo.getNombre());
                }
                insumo.setStockActual(insumo.getStockActual() - detalle.getCantidad());
                
                // Agregar a la lista para recalcular después de eliminar el movimiento
                insumosParaRecalcular.add(insumo.getId());
                
            } else if (movimiento.getTipoMovimiento() == TipoMovimiento.SALIDA) {
                // Para salida: sumar cantidad al stock
                insumo.setStockActual(insumo.getStockActual() + detalle.getCantidad());
            }
            
            insumoRepository.save(insumo);
        }
        
        // Eliminar el movimiento PRIMERO
        movimientoRepository.delete(movimiento);

        // AHORA recalcular precio de compra para movimientos de entrada
        for (Long insumoId : insumosParaRecalcular) {
            Insumo insumo = insumoRepository.findById(insumoId).orElse(null);
            if (insumo != null) {
                recalcularPrecioCompraInsumo(insumo);
                insumoRepository.save(insumo);
            }
        }

        // Recalcular precios de inversión de productos que usan estos insumos
        for (Long insumoId : insumosParaRecalcular) {
            recalcularPrecioInversionProductos(insumoId);
        }

        return movimiento;
    }

    /**
     * Recalcula el precio de inversión de todos los productos que usen el insumo especificado
     */
    private void recalcularPrecioInversionProductos(Long insumoId) {
        try {
            System.out.println("Recalculando productos para insumo ID: " + insumoId);
            
            // Obtener todos los productos que usen este insumo
            List<Producto> productos = productoRepository.findAll().stream()
                    .filter(producto -> producto.getReceta() != null && 
                            producto.getReceta().getDetalles().stream()
                                    .anyMatch(detalle -> detalle.getInsumo().getId().equals(insumoId)))
                    .toList();

            System.out.println("Productos encontrados que usan el insumo: " + productos.size());

            for (Producto producto : productos) {
                double nuevoPrecioInversion = 0.0;
                
                // Calcular el nuevo precio de inversión basado en los precios actuales de los insumos
                for (InsumoReceta detalle : producto.getReceta().getDetalles()) {
                    Insumo insumo = detalle.getInsumo();
                    double costoInsumo = insumo.getPrecioDeCompra() * detalle.getCantidad();
                    nuevoPrecioInversion += costoInsumo;
                }
                
                System.out.println("Producto: " + producto.getNombre() + " - Nuevo precio: " + nuevoPrecioInversion);
                producto.setPrecioInversion(nuevoPrecioInversion);
                productoRepository.save(producto);
            }
        } catch (Exception e) {
            System.err.println("Error en recalcularPrecioInversionProductos: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    private void recalcularPrecioCompraInsumo(Insumo insumo) {
        // Obtener todos los movimientos de entrada para este insumo
        List<DetalleMovimientoInsumo> detallesEntrada = detalleMovimientoInsumoRepository
                .findByInsumoAndMovimiento_TipoMovimiento(insumo, TipoMovimiento.ENTRADA);

        if (detallesEntrada.isEmpty()) {
            // Si no hay movimientos de entrada, resetear precio
            insumo.setPrecioDeCompra(0.0);
        } else {
            // Usar el precio del último movimiento de entrada
            DetalleMovimientoInsumo ultimoMovimiento = detallesEntrada.get(detallesEntrada.size() - 1);
            double precioPorUnidad = ultimoMovimiento.getPrecioTotal() / ultimoMovimiento.getCantidad();
            insumo.setPrecioDeCompra(precioPorUnidad);
        }
    }

    /**
     * Calcula el stock disponible de un insumo en una fecha específica
     * Considera todos los movimientos hasta esa fecha
     */
    private double calcularStockDisponibleEnFecha(Insumo insumo, LocalDate fecha) {
        double stockInicial = 0.0;
        
        // Obtener todos los movimientos del insumo hasta la fecha especificada
        List<DetalleMovimientoInsumo> movimientosHastaFecha = insumo.getMovimientos().stream()
                .filter(detalle -> detalle.getMovimiento().getFecha().isBefore(fecha) || 
                                 detalle.getMovimiento().getFecha().isEqual(fecha))
                .sorted(Comparator.comparing(detalle -> detalle.getMovimiento().getFecha()))
                .collect(Collectors.toList());
        
        // Calcular stock acumulado
        for (DetalleMovimientoInsumo detalle : movimientosHastaFecha) {
            if (detalle.getMovimiento().getTipoMovimiento() == TipoMovimiento.ENTRADA) {
                stockInicial += detalle.getCantidad();
            } else if (detalle.getMovimiento().getTipoMovimiento() == TipoMovimiento.SALIDA) {
                stockInicial -= detalle.getCantidad();
            }
        }
        
        return stockInicial;
    }

    /**
     * Valida si un movimiento de insumo puede ser editado
     * Implementa las reglas de negocio para edición segura
     */
    public ValidacionEdicionDTO validarEdicionMovimiento(Long movimientoId) {
        List<String> detallesValidacion = new ArrayList<>();
        
        try {
            MovimientoInsumoLote movimiento = movimientoRepository.findById(movimientoId)
                    .orElseThrow(() -> new IllegalArgumentException("Movimiento no encontrado"));

            // Condición 1: No hay movimientos posteriores del mismo insumo
            for (DetalleMovimientoInsumo detalle : movimiento.getDetalles()) {
                Insumo insumo = detalle.getInsumo();
                
                // Verificar si hay movimientos posteriores de este insumo
                List<DetalleMovimientoInsumo> movimientosPosteriores = insumo.getMovimientos().stream()
                        .filter(m -> m.getMovimiento().getFecha().isAfter(movimiento.getFecha()))
                        .collect(Collectors.toList());
                
                if (!movimientosPosteriores.isEmpty()) {
                    detallesValidacion.add("El insumo '" + insumo.getNombre() + 
                        "' tiene " + movimientosPosteriores.size() + " movimiento(s) posterior(es)");
                }
            }

            // Condición 2: El insumo NO se ha usado en producción de productos
            for (DetalleMovimientoInsumo detalle : movimiento.getDetalles()) {
                Insumo insumo = detalle.getInsumo();
                
                // Verificar si el insumo se ha usado en producción después de este movimiento
                List<Producto> productosQueUsanInsumo = productoRepository.findAll().stream()
                        .filter(producto -> producto.getReceta() != null && 
                                producto.getReceta().getDetalles().stream()
                                        .anyMatch(d -> d.getInsumo().getId().equals(insumo.getId())))
                        .toList();
                
                if (!productosQueUsanInsumo.isEmpty()) {
                    // Verificar si algún producto fue producido después de este movimiento
                    boolean hayProduccionPosterior = productosQueUsanInsumo.stream()
                            .anyMatch(producto -> {
                                // Aquí deberías verificar si el producto fue producido después de la fecha del movimiento
                                // Por simplicidad, asumimos que si el producto existe, ya fue producido
                                return true; // En una implementación real, verificarías fechas de producción
                            });
                    
                    if (hayProduccionPosterior) {
                        detallesValidacion.add("El insumo '" + insumo.getNombre() + 
                            "' ha sido usado en la producción de productos");
                    }
                }
            }

            // Condición 3: No hay movimientos de salida posteriores
            for (DetalleMovimientoInsumo detalle : movimiento.getDetalles()) {
                Insumo insumo = detalle.getInsumo();
                
                List<DetalleMovimientoInsumo> salidasPosteriores = insumo.getMovimientos().stream()
                        .filter(m -> m.getMovimiento().getFecha().isAfter(movimiento.getFecha()) &&
                                   m.getMovimiento().getTipoMovimiento() == TipoMovimiento.SALIDA)
                        .collect(Collectors.toList());
                
                if (!salidasPosteriores.isEmpty()) {
                    detallesValidacion.add("El insumo '" + insumo.getNombre() + 
                        "' tiene " + salidasPosteriores.size() + " salida(s) posterior(es)");
                }
            }

            // Condición 4: No afecta el cálculo de precios de inversión de productos
            if (movimiento.getTipoMovimiento() == TipoMovimiento.ENTRADA) {
                for (DetalleMovimientoInsumo detalle : movimiento.getDetalles()) {
                    Insumo insumo = detalle.getInsumo();
                    
                    // Verificar si este insumo contribuye al costo de productos ya producidos
                    List<Producto> productosAfectados = productoRepository.findAll().stream()
                            .filter(producto -> producto.getReceta() != null && 
                                    producto.getReceta().getDetalles().stream()
                                            .anyMatch(d -> d.getInsumo().getId().equals(insumo.getId())))
                            .toList();
                    
                    if (!productosAfectados.isEmpty()) {
                        detallesValidacion.add("La edición de este movimiento de entrada afectaría el costo de " + 
                            productosAfectados.size() + " producto(s) ya producido(s)");
                    }
                }
            }

            boolean puedeEditar = detallesValidacion.isEmpty();
            String razon = puedeEditar ? 
                "El movimiento puede ser editado sin problemas" : 
                "El movimiento no puede ser editado por las siguientes razones:";

            return new ValidacionEdicionDTO(puedeEditar, razon, detallesValidacion);

        } catch (Exception e) {
            return new ValidacionEdicionDTO(false, "Error al validar edición: " + e.getMessage(), 
                List.of("Error interno: " + e.getMessage()));
        }
    }

    /**
     * Edita un movimiento de insumo existente
     * Solo se ejecuta si la validación es exitosa
     */
    @Transactional
    public MovimientoInsumoLote editarMovimientoInsumo(EditarMovimientoDeInsumoDTO dto) {
        try {
            // Primero validar que se puede editar
            ValidacionEdicionDTO validacion = validarEdicionMovimiento(dto.id());
            if (!validacion.puedeEditar()) {
                throw new IllegalArgumentException("No se puede editar el movimiento: " + validacion.razon());
            }

            MovimientoInsumoLote movimiento = movimientoRepository.findById(dto.id())
                    .orElseThrow(() -> new IllegalArgumentException("Movimiento no encontrado"));

            // Revertir el movimiento original
            for (DetalleMovimientoInsumo detalle : movimiento.getDetalles()) {
                Insumo insumo = detalle.getInsumo();
                
                if (movimiento.getTipoMovimiento() == TipoMovimiento.ENTRADA) {
                    insumo.setStockActual(insumo.getStockActual() - detalle.getCantidad());
                } else {
                    insumo.setStockActual(insumo.getStockActual() + detalle.getCantidad());
                }
                insumoRepository.save(insumo);
            }

            // Limpiar detalles existentes
            movimiento.getDetalles().clear();

            // Actualizar datos básicos del movimiento
            movimiento.setFecha(dto.fecha());
            movimiento.setDescripcion(dto.descripcion());
            movimiento.setTipoMovimiento(dto.tipoMovimiento());

            // Aplicar los nuevos detalles
            List<Long> insumosParaRecalcular = new ArrayList<>();
            
            for (DetalleMovimientoInsumoDTO detalleDto : dto.detalles()) {
                Insumo insumo = insumoRepository.findById(detalleDto.insumoId())
                        .orElseThrow(() -> new IllegalArgumentException("Insumo no encontrado: " + detalleDto.insumoId()));

                // Validaciones básicas
                if (detalleDto.cantidad() <= 0) {
                    throw new IllegalArgumentException("La cantidad debe ser mayor a 0 para el insumo: " + insumo.getNombre());
                }

                if (dto.tipoMovimiento() == TipoMovimiento.ENTRADA) {
                    if (detalleDto.precio() <= 0) {
                        throw new IllegalArgumentException("El precio debe ser mayor a 0 para el insumo: " + insumo.getNombre());
                    }
                }

                // Aplicar cambios al stock
                if (dto.tipoMovimiento() == TipoMovimiento.ENTRADA) {
                    insumo.setStockActual(insumo.getStockActual() + detalleDto.cantidad());
                    double precioPorUnidad = detalleDto.precio() / detalleDto.cantidad();
                    insumo.setPrecioDeCompra(precioPorUnidad);
                    insumosParaRecalcular.add(insumo.getId());
                } else {
                    insumo.setStockActual(insumo.getStockActual() - detalleDto.cantidad());
                }

                insumoRepository.save(insumo);

                // Crear nuevo detalle
                DetalleMovimientoInsumo nuevoDetalle = new DetalleMovimientoInsumo(detalleDto.cantidad());
                nuevoDetalle.setInsumo(insumo);
                if (dto.tipoMovimiento() == TipoMovimiento.ENTRADA) {
                    nuevoDetalle.setPrecioTotal(detalleDto.precio());
                }
                movimiento.addDetalle(nuevoDetalle);
            }

            // Guardar el movimiento actualizado
            MovimientoInsumoLote movimientoActualizado = movimientoRepository.save(movimiento);

            // Recalcular precios de inversión de productos
            for (Long insumoId : insumosParaRecalcular) {
                recalcularPrecioInversionProductos(insumoId);
            }

            return movimientoActualizado;

        } catch (Exception e) {
            System.err.println("Error en editarMovimientoInsumo: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }


}

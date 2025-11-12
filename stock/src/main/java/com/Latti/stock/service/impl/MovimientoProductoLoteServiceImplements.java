package com.Latti.stock.service.impl;

import com.Latti.stock.dtos.CrearMovimientoProductoDTO;
import com.Latti.stock.dtos.DetalleMovimientoProductoDTO;
import com.Latti.stock.dtos.ResponseDetalleMovimientoProductoDTO;
import com.Latti.stock.dtos.ResponseMovimientosProductoLoteDTO;
import com.Latti.stock.dtos.StockPorLoteDTO;
import com.Latti.stock.dtos.CrearVentaPorLotesDTO;
import com.Latti.stock.dtos.VentaPorLoteDTO;
import com.Latti.stock.modules.DetalleMovimientoProducto;
import com.Latti.stock.modules.MovimientoProductoLote;
import com.Latti.stock.modules.Producto;
import com.Latti.stock.modules.TipoMovimiento;
import com.Latti.stock.modules.InsumoReceta;
import com.Latti.stock.modules.Insumo;
import com.Latti.stock.modules.DetalleMovimientoInsumo;
import com.Latti.stock.repositories.MovimientoProductoLoteRepository;
import com.Latti.stock.repositories.ProductoRepository;
import com.Latti.stock.repositories.InsumoRepository;
import com.Latti.stock.repositories.DetalleMovimientoProductoRepository;
import com.Latti.stock.service.MovimientoProductoLoteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.Set;
import java.util.HashSet;
import java.util.stream.Collectors;

@Service
public class MovimientoProductoLoteServiceImplements implements MovimientoProductoLoteService {

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private MovimientoProductoLoteRepository movimientoRepository;

    @Autowired
    private InsumoRepository insumoRepository;

    @Autowired
    private DetalleMovimientoProductoRepository detalleMovimientoProductoRepository;

    @Override
    @Transactional
    public MovimientoProductoLote crearMovimientoProducto(CrearMovimientoProductoDTO dto) {
        try {
            // ✅ CRÍTICO: Validar fecha antes de crear el movimiento
            validarFecha(dto.fecha(), "movimiento de producto");
            
            MovimientoProductoLote movimiento = new MovimientoProductoLote(
                    dto.fecha(),
                    dto.descripcion(),
                    dto.tipoMovimiento()
            );

            for (DetalleMovimientoProductoDTO d : dto.detalles()) {
                // Validar que el producto existe
                Producto producto = productoRepository.findById(d.id())
                        .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado: " + d.id()));

                // Validar cantidad positiva
                if (d.cantidad() <= 0) {
                    throw new IllegalArgumentException("La cantidad debe ser mayor a 0 para el producto: " + producto.getNombre());
                }

                // Validaciones específicas para SALIDA
                if (dto.tipoMovimiento() == TipoMovimiento.SALIDA) {
                    // Verificar que el producto haya sido producido antes o en la misma fecha
                    LocalDate fechaPrimeraProduccion = producto.getMovimientos().stream()
                            .filter(detalle -> detalle.getMovimiento().getTipoMovimiento() == TipoMovimiento.ENTRADA)
                            .map(detalle -> detalle.getMovimiento().getFecha())
                            .min(LocalDate::compareTo)
                            .orElse(null);

                    if (fechaPrimeraProduccion == null || dto.fecha().isBefore(fechaPrimeraProduccion)) {
                        String fechaReferencia = fechaPrimeraProduccion != null
                                ? fechaPrimeraProduccion.toString()
                                : "ninguna fecha registrada";
                        throw new IllegalArgumentException(
                                "No se puede registrar la salida del producto '" + producto.getNombre() + "' en la fecha " +
                                dto.fecha() + " porque la primera producción registrada es del " + fechaReferencia +
                                ". Por favor, verifica las fechas de producción y venta."
                        );
                    }

                    // ✅ CRÍTICO: Si se especifica un lote, validar stock en ese lote específico
                    if (d.lote() != null && !d.lote().trim().isEmpty()) {
                        // Validar que el lote exista y tenga stock suficiente
                        double stockDisponibleEnLote = obtenerStockDisponibleEnLote(producto, d.lote());
                        if (stockDisponibleEnLote < d.cantidad()) {
                            throw new IllegalArgumentException(
                                "Stock insuficiente en el lote '" + d.lote() + "' para el producto '" + producto.getNombre() + 
                                "'. Stock disponible en lote: " + stockDisponibleEnLote + 
                                ", Cantidad solicitada: " + d.cantidad()
                            );
                        }
                        
                        // Validar fecha de creación del lote vs fecha de venta
                        LocalDate fechaCreacionLote = producto.getMovimientos().stream()
                                .filter(detalle -> detalle.getMovimiento().getTipoMovimiento() == TipoMovimiento.ENTRADA)
                                .filter(detalle -> d.lote().equals(detalle.getLote()))
                                .map(detalle -> detalle.getMovimiento().getFecha())
                                .min(LocalDate::compareTo)
                                .orElse(null);
                        
                        if (fechaCreacionLote == null) {
                            throw new IllegalArgumentException(
                                "No se encontró la producción (lote '" + d.lote() + "') del producto '" + producto.getNombre() +
                                "'. Verifica que el lote exista antes de registrar la venta."
                            );
                        }
                        
                        if (dto.fecha().isBefore(fechaCreacionLote)) {
                            throw new IllegalArgumentException(
                                "No se puede vender unidades del lote '" + d.lote() + "' del producto '" + producto.getNombre() +
                                "' en la fecha " + dto.fecha() + " porque el lote se produjo el " + fechaCreacionLote + "."
                            );
                        }
                        
                        // Validar que el lote no esté vencido
                        LocalDate fechaVencimientoLote = obtenerFechaVencimientoLote(producto, d.lote());
                        if (fechaVencimientoLote != null && fechaVencimientoLote.isBefore(LocalDate.now())) {
                            throw new IllegalArgumentException(
                                "No se puede vender unidades del lote '" + d.lote() + "' del producto '" + producto.getNombre() +
                                "' porque el lote venció el " + fechaVencimientoLote + "."
                            );
                        }
                    } else {
                        // Si NO se especifica lote, validar stock total disponible
                        double stockDisponibleEnFecha = calcularStockDisponibleEnFecha(producto, dto.fecha());
                        if (stockDisponibleEnFecha < d.cantidad()) {
                            throw new IllegalArgumentException(
                                "Stock insuficiente para el producto '" + producto.getNombre() + 
                                "' en la fecha " + dto.fecha() + 
                                ". Stock disponible en esa fecha: " + stockDisponibleEnFecha + 
                                ", Cantidad solicitada: " + d.cantidad()
                            );
                        }
                    }
                    
                    // Validar precio de venta positivo
                    if (d.precioVenta() <= 0) {
                        throw new IllegalArgumentException("El precio de venta debe ser mayor a 0 para el producto: " + producto.getNombre());
                    }
                }

                // Validaciones específicas para ENTRADA
                if (dto.tipoMovimiento() == TipoMovimiento.ENTRADA) {
                    // Validar fecha de vencimiento (debe ser futura)
                    if (d.fechaVencimiento() != null && d.fechaVencimiento().isBefore(java.time.LocalDate.now())) {
                        throw new IllegalArgumentException("La fecha de vencimiento debe ser futura para el producto: " + producto.getNombre());
                    }
                }

                // Actualizar stock según tipo
                if (dto.tipoMovimiento() == TipoMovimiento.ENTRADA) {
                    // ✅ NUEVA VALIDACIÓN: Verificar stock histórico de insumos ANTES de producir
                    if (producto.getReceta() != null) {
                        validarStockHistoricoInsumosParaProduccion(producto, d.cantidad(), dto.fecha());
                    }
                    
                    producto.setStockActual(producto.getStockActual() + d.cantidad());
                    
                    // Para ENTRADA (producción): restar insumos de la receta
                    if (producto.getReceta() != null) {
                        restarInsumosDeReceta(producto, d.cantidad(), dto.fecha());
                    }
                } else {
                    producto.setStockActual(producto.getStockActual() - d.cantidad());
                }

                // Actualizar precio de venta solo para SALIDA
                if (dto.tipoMovimiento() == TipoMovimiento.SALIDA) {
                    producto.setPrecioVenta(d.precioVenta());
                }

                // Guardar el producto actualizado
                productoRepository.save(producto);

                // Crear el detalle
                DetalleMovimientoProducto detalle = new DetalleMovimientoProducto(
                        d.cantidad(),
                        producto
                );
                detalle.setFechaVencimiento(d.fechaVencimiento());
                
                // ✅ CRÍTICO: Asignar lote si se especifica (para SALIDA) o generar automáticamente (para ENTRADA)
                if (dto.tipoMovimiento() == TipoMovimiento.ENTRADA) {
                    // El lote se generará automáticamente cuando se guarde el movimiento
                    // y se tenga acceso al ID del movimiento
                } else if (dto.tipoMovimiento() == TipoMovimiento.SALIDA && d.lote() != null && !d.lote().trim().isEmpty()) {
                    // Para SALIDA, usar el lote especificado en el DTO
                    detalle.setLote(d.lote());
                }
                // Si es SALIDA sin lote especificado, el lote queda null (venta genérica)

                // Establecer relaciones
                movimiento.addDetalle(detalle);
            }

            // Guardar el movimiento primero para obtener el ID
            MovimientoProductoLote movimientoGuardado = movimientoRepository.save(movimiento);
            
            // Generar lotes automáticamente para movimientos de ENTRADA
            if (dto.tipoMovimiento() == TipoMovimiento.ENTRADA) {
                for (DetalleMovimientoProducto detalle : movimientoGuardado.getDetalles()) {
                    // Generar lote basado en el ID del movimiento
                    String lote = "LOTE-" + movimientoGuardado.getId();
                    detalle.setLote(lote);
                }
                // Guardar nuevamente para persistir los lotes
                return movimientoRepository.save(movimientoGuardado);
            }
            
            return movimientoGuardado;
        } catch (Exception e) {
            System.err.println("Error en crearMovimientoProducto: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @Override
    public List<ResponseMovimientosProductoLoteDTO> obtenerMovimientosDTO() {
        return movimientoRepository.findAll().stream().map(mov ->
                new ResponseMovimientosProductoLoteDTO(
                        mov.getId(),
                        mov.getFecha(),
                        mov.getDescripcion(),
                        mov.getTipoMovimiento(),
                        mov.getDetalles().stream().map(det ->
                                new ResponseDetalleMovimientoProductoDTO(
                                        det.getProducto().getId(),
                                        det.getProducto().getNombre(),
                                        det.getCantidad(),
                                        det.getProducto().getPrecioInversion(),
                                        det.getProducto().getPrecioVenta(),
                                        det.getFechaVencimiento(),
                                        det.getLote()
                                )
                        ).toList()
                )
        ).toList();
    }

    @Override
    @Transactional
    public MovimientoProductoLote editarMovimientoProducto(Long id, CrearMovimientoProductoDTO dto) {
        System.out.println("✏️ BACKEND: Intentando editar movimiento de producto con ID: " + id);
        
        MovimientoProductoLote movimientoOriginal = movimientoRepository.findById(id)
                .orElseThrow(() -> {
                    System.out.println("❌ BACKEND: Movimiento de producto con ID " + id + " no encontrado");
                    return new IllegalArgumentException("Movimiento no encontrado");
                });
        
        System.out.println("✅ BACKEND: Movimiento encontrado: " + movimientoOriginal.getId());
        
        // Solo permitir editar movimientos de ENTRADA (producción)
        if (movimientoOriginal.getTipoMovimiento() != TipoMovimiento.ENTRADA) {
            throw new IllegalArgumentException("Solo se pueden editar movimientos de entrada (producción)");
        }
        
        if (dto.tipoMovimiento() != TipoMovimiento.ENTRADA) {
            throw new IllegalArgumentException("Solo se pueden editar movimientos de entrada (producción)");
        }
        
        // ✅ CRÍTICO: Validar que no haya movimientos de salida que usen los lotes de este movimiento
        for (DetalleMovimientoProducto detalleOriginal : movimientoOriginal.getDetalles()) {
            Producto producto = detalleOriginal.getProducto();
            String loteOriginal = detalleOriginal.getLote();
            
            if (loteOriginal != null && !loteOriginal.trim().isEmpty()) {
                // Verificar si hay movimientos de salida que usen este lote
                boolean haySalidasConEsteLote = producto.getMovimientos().stream()
                        .anyMatch(detalle -> {
                            MovimientoProductoLote mov = detalle.getMovimiento();
                            return mov.getTipoMovimiento() == TipoMovimiento.SALIDA &&
                                   mov.getFecha().isAfter(movimientoOriginal.getFecha()) &&
                                   loteOriginal.equals(detalle.getLote());
                        });
                
                if (haySalidasConEsteLote) {
                    throw new IllegalArgumentException(
                        "No se puede editar el movimiento de entrada porque hay movimientos de salida posteriores " +
                        "que usan el lote '" + loteOriginal + "' del producto '" + producto.getNombre() + "'. " +
                        "Elimine primero los movimientos de salida asociados a este lote."
                    );
                }
                
                // También verificar salidas en la misma fecha (más estricto)
                boolean haySalidasMismaFecha = producto.getMovimientos().stream()
                        .anyMatch(detalle -> {
                            MovimientoProductoLote mov = detalle.getMovimiento();
                            return mov.getTipoMovimiento() == TipoMovimiento.SALIDA &&
                                   mov.getFecha().isEqual(movimientoOriginal.getFecha()) &&
                                   loteOriginal.equals(detalle.getLote());
                        });
                
                if (haySalidasMismaFecha) {
                    throw new IllegalArgumentException(
                        "No se puede editar el movimiento de entrada porque hay movimientos de salida en la misma fecha " +
                        "que usan el lote '" + loteOriginal + "' del producto '" + producto.getNombre() + "'. " +
                        "Elimine primero los movimientos de salida asociados a este lote."
                    );
                }
            }
        }
        
        // PASO 1: Revertir los cambios del movimiento original
        System.out.println("🔄 Revertiendo cambios del movimiento original...");
        
        // Lista para restaurar insumos del movimiento original
        List<Object[]> insumosParaRestaurar = new ArrayList<>();
        
        for (DetalleMovimientoProducto detalleOriginal : movimientoOriginal.getDetalles()) {
            Producto producto = detalleOriginal.getProducto();
            
            // Revertir stock del producto
            if (producto.getStockActual() < detalleOriginal.getCantidad()) {
                throw new IllegalArgumentException("No se puede editar el movimiento. Stock insuficiente para revertir: " + producto.getNombre());
            }
            producto.setStockActual(producto.getStockActual() - detalleOriginal.getCantidad());
            
            // Guardar información para restaurar insumos
            if (producto.getReceta() != null) {
                for (InsumoReceta detalleReceta : producto.getReceta().getDetalles()) {
                    Insumo insumo = detalleReceta.getInsumo();
                    double cantidadInsumoARestaurar = detalleReceta.getCantidad() * detalleOriginal.getCantidad();
                    insumosParaRestaurar.add(new Object[]{insumo.getId(), cantidadInsumoARestaurar});
                }
            }
            
            productoRepository.save(producto);
        }
        
        // Restaurar insumos del movimiento original
        for (Object[] insumoInfo : insumosParaRestaurar) {
            Long insumoId = (Long) insumoInfo[0];
            Double cantidadARestaurar = (Double) insumoInfo[1];
            
            Insumo insumo = insumoRepository.findById(insumoId).orElse(null);
            if (insumo != null) {
                insumo.setStockActual(insumo.getStockActual() + cantidadARestaurar);
                insumoRepository.save(insumo);
                System.out.println("  ✅ Restaurado insumo ID " + insumoId + ": +" + cantidadARestaurar);
            }
        }
        
        // PASO 2: Limpiar detalles antiguos
        // ✅ CRÍTICO: Eliminar explícitamente los detalles antiguos de la BD
        int cantidadDetallesAntiguos = movimientoOriginal.getDetalles().size();
        System.out.println("🗑️ Eliminando " + cantidadDetallesAntiguos + " detalles antiguos del movimiento " + id + "...");
        
        // Vaciar la lista primero (para romper la relación en memoria)
        movimientoOriginal.getDetalles().clear();
        
        // Eliminar DIRECTAMENTE de la BD usando query personalizada
        detalleMovimientoProductoRepository.deleteByMovimientoId(id);
        detalleMovimientoProductoRepository.flush();
        System.out.println("✅ Detalles antiguos eliminados de la BD");
        
        // PASO 3: Aplicar los nuevos cambios (similar a crearMovimientoProducto)
        System.out.println("📝 Aplicando nuevos cambios...");
        
        // ✅ CRÍTICO: Validar fecha nueva antes de continuar
        validarFecha(dto.fecha(), "movimiento de producto");
        
        // ✅ CRÍTICO: Si se cambió la fecha, revalidar contra insumos históricos
        LocalDate fechaOriginal = movimientoOriginal.getFecha();
        LocalDate fechaNueva = dto.fecha();
        
        if (!fechaOriginal.equals(fechaNueva)) {
            System.out.println("⚠️ La fecha cambió de " + fechaOriginal + " a " + fechaNueva + ". Revalidando stock histórico de insumos...");
            
            // Revalidar stock histórico de insumos con la nueva fecha
            for (DetalleMovimientoProductoDTO d : dto.detalles()) {
                Producto producto = productoRepository.findById(d.id())
                        .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado: " + d.id()));
                
                if (producto.getReceta() != null) {
                    validarStockHistoricoInsumosParaProduccion(producto, d.cantidad(), fechaNueva);
                }
            }
            
            System.out.println("✅ Validación de fecha nueva completada exitosamente");
        }
        
        movimientoOriginal.setFecha(dto.fecha());
        movimientoOriginal.setDescripcion(dto.descripcion());
        
        for (DetalleMovimientoProductoDTO d : dto.detalles()) {
            Producto producto = productoRepository.findById(d.id())
                    .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado: " + d.id()));

            if (d.cantidad() <= 0) {
                throw new IllegalArgumentException("La cantidad debe ser mayor a 0 para el producto: " + producto.getNombre());
            }

            // Validar stock histórico de insumos ANTES de producir
            if (producto.getReceta() != null) {
                validarStockHistoricoInsumosParaProduccion(producto, d.cantidad(), dto.fecha());
            }

            // Actualizar stock del producto
            producto.setStockActual(producto.getStockActual() + d.cantidad());
            
            // Restar insumos de la receta
            if (producto.getReceta() != null) {
                restarInsumosDeReceta(producto, d.cantidad(), dto.fecha());
            }

            productoRepository.save(producto);

            // Crear nuevo detalle
            DetalleMovimientoProducto nuevoDetalle = new DetalleMovimientoProducto(d.cantidad(), producto);
            nuevoDetalle.setFechaVencimiento(d.fechaVencimiento());
            movimientoOriginal.addDetalle(nuevoDetalle);
        }

        // Guardar el movimiento actualizado
        MovimientoProductoLote movimientoActualizado = movimientoRepository.save(movimientoOriginal);
        
        // Generar lotes automáticamente para movimientos de ENTRADA
        for (DetalleMovimientoProducto detalle : movimientoActualizado.getDetalles()) {
            String lote = "LOTE-" + movimientoActualizado.getId();
            detalle.setLote(lote);
        }
        
        return movimientoRepository.save(movimientoActualizado);
    }

    @Override
    @Transactional
    public MovimientoProductoLote eliminarMovimientoProducto(Long id) {
        System.out.println("🗑️ BACKEND: Intentando eliminar movimiento de producto con ID: " + id);
        
        MovimientoProductoLote movimiento = movimientoRepository.findById(id)
                .orElseThrow(() -> {
                    System.out.println("❌ BACKEND: Movimiento de producto con ID " + id + " no encontrado");
                    return new IllegalArgumentException("Movimiento no encontrado");
                });
        
        System.out.println("✅ BACKEND: Movimiento encontrado: " + movimiento.getId() + " - " + movimiento.getDescripcion());

        // ✅ CRÍTICO: Validar según el tipo de movimiento
        if (movimiento.getTipoMovimiento() == TipoMovimiento.ENTRADA) {
            // Para ENTRADA: Validar que no haya salidas que usen los lotes
            for (DetalleMovimientoProducto detalle : movimiento.getDetalles()) {
                Producto producto = detalle.getProducto();
                String lote = detalle.getLote();
                
                if (lote != null && !lote.trim().isEmpty()) {
                    // Verificar si hay movimientos de salida que usen este lote
                    boolean haySalidasConEsteLote = producto.getMovimientos().stream()
                            .anyMatch(detalleSalida -> {
                                MovimientoProductoLote mov = detalleSalida.getMovimiento();
                                return mov.getTipoMovimiento() == TipoMovimiento.SALIDA &&
                                       (mov.getFecha().isAfter(movimiento.getFecha()) ||
                                        mov.getFecha().isEqual(movimiento.getFecha())) &&
                                       lote.equals(detalleSalida.getLote());
                            });
                    
                    if (haySalidasConEsteLote) {
                        throw new IllegalArgumentException(
                            "No se puede eliminar el movimiento de entrada porque hay movimientos de salida " +
                            "que usan el lote '" + lote + "' del producto '" + producto.getNombre() + "'. " +
                            "Elimine primero los movimientos de salida asociados a este lote."
                        );
                    }
                }
            }
        } else if (movimiento.getTipoMovimiento() == TipoMovimiento.SALIDA) {
            // ✅ Para SALIDA: Permitir eliminación (puede ser una devolución)
            // El stock se restaurará automáticamente al lote cuando se elimine el movimiento
            // porque el cálculo de stock por lote es dinámico (entradas - salidas)
            System.out.println("🔄 Eliminando movimiento de SALIDA (venta/devolución)");
            System.out.println("  - El stock se restaurará automáticamente al lote al eliminar este movimiento");
            
            // ✅ OPCIONAL: Validación ligera del lote (solo si es posible sin errores)
            for (DetalleMovimientoProducto detalle : movimiento.getDetalles()) {
                Producto producto = detalle.getProducto();
                
                // ✅ Validar que el producto no sea null
                if (producto == null) {
                    System.err.println("⚠️ ADVERTENCIA: Producto es null en detalle del movimiento " + id);
                    continue;
                }
                
                String lote = detalle.getLote();
                
                // Si hay un lote específico, solo loguear (no bloquear)
                if (lote != null && !lote.trim().isEmpty()) {
                    System.out.println("  - Restaurando " + detalle.getCantidad() + " unidades al lote '" + lote + 
                                     "' del producto '" + producto.getNombre() + "'");
                } else {
                    System.out.println("  - Restaurando " + detalle.getCantidad() + " unidades al stock general del producto '" + 
                                     producto.getNombre() + "' (venta sin lote específico)");
                }
            }
        }

        // Lista para restaurar insumos después de eliminar el movimiento
        List<Object[]> insumosParaRestaurar = new ArrayList<>();

        // Revertir cambios en cada producto
        for (DetalleMovimientoProducto detalle : movimiento.getDetalles()) {
            Producto producto = detalle.getProducto();
            
            // ✅ NUEVO: Validar que el producto no sea null
            if (producto == null) {
                System.err.println("⚠️ ADVERTENCIA: Producto es null en detalle del movimiento " + id);
                continue; // Saltar este detalle y continuar con el siguiente
            }
            
            // ✅ NUEVO: Recargar el producto desde la BD para asegurar que tenemos la versión más actualizada
            producto = productoRepository.findById(producto.getId())
                    .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado: " + producto.getId()));
            
            if (movimiento.getTipoMovimiento() == TipoMovimiento.ENTRADA) {
                // Para entrada: restar cantidad del stock
                if (producto.getStockActual() < detalle.getCantidad()) {
                    throw new IllegalArgumentException("No se puede eliminar el movimiento. Stock insuficiente para revertir: " + producto.getNombre());
                }
                producto.setStockActual(producto.getStockActual() - detalle.getCantidad());
                
                // Guardar información para restaurar insumos después de eliminar el movimiento
                if (producto.getReceta() != null) {
                    for (InsumoReceta detalleReceta : producto.getReceta().getDetalles()) {
                        Insumo insumo = detalleReceta.getInsumo();
                        if (insumo != null) {
                            double cantidadInsumoARestaurar = detalleReceta.getCantidad() * detalle.getCantidad();
                            insumosParaRestaurar.add(new Object[]{insumo.getId(), cantidadInsumoARestaurar});
                        }
                    }
                }
                
            } else if (movimiento.getTipoMovimiento() == TipoMovimiento.SALIDA) {
                // Para salida: sumar cantidad al stock
                producto.setStockActual(producto.getStockActual() + detalle.getCantidad());
                
                // Nota: No restauramos el precio de venta anterior porque no lo guardamos
                // El precio de venta se mantiene como el último establecido
            }
            
            productoRepository.save(producto);
        }
        
        // Eliminar el movimiento PRIMERO
        movimientoRepository.delete(movimiento);

        // AHORA restaurar insumos para movimientos de entrada
        for (Object[] insumoInfo : insumosParaRestaurar) {
            Long insumoId = (Long) insumoInfo[0];
            Double cantidadARestaurar = (Double) insumoInfo[1];
            
            Insumo insumo = insumoRepository.findById(insumoId).orElse(null);
            if (insumo != null) {
                insumo.setStockActual(insumo.getStockActual() + cantidadARestaurar);
                insumoRepository.save(insumo);
            }
        }

        return movimiento;
    }

    /**
     * Crea una venta específica por lotes
     */
    @Transactional
    public MovimientoProductoLote crearVentaPorLotes(CrearVentaPorLotesDTO dto) {
        try {
            // ✅ CRÍTICO: Validar fecha antes de crear la venta
            validarFecha(dto.fecha(), "venta por lotes");
            
            // ✅ VALIDACIÓN: Verificar que no haya ventas duplicadas (mismo producto + mismo lote)
            Set<String> ventasUnicas = new HashSet<>();
            for (VentaPorLoteDTO venta : dto.ventasPorLotes()) {
                String clave = venta.productoId() + "|" + venta.lote();
                if (ventasUnicas.contains(clave)) {
                    throw new IllegalArgumentException(
                        "No se puede vender el mismo producto del mismo lote ('" + venta.lote() + 
                        "') más de una vez en el mismo movimiento."
                    );
                }
                ventasUnicas.add(clave);
            }
            
            MovimientoProductoLote movimiento = new MovimientoProductoLote(
                    dto.fecha(),
                    dto.descripcion(),
                    TipoMovimiento.SALIDA
            );

            for (VentaPorLoteDTO venta : dto.ventasPorLotes()) {
                Producto producto = productoRepository.findById(venta.productoId())
                        .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado: " + venta.productoId()));

                // Validar cantidad positiva
                if (venta.cantidad() <= 0) {
                    throw new IllegalArgumentException("La cantidad debe ser mayor a 0 para el producto: " + producto.getNombre());
                }

                // Validar precio de venta positivo
                if (venta.precioVenta() <= 0) {
                    throw new IllegalArgumentException("El precio de venta debe ser mayor a 0 para el producto: " + producto.getNombre());
                }

            // Validar que exista producción previa a la fecha de venta
            LocalDate fechaPrimeraProduccion = producto.getMovimientos().stream()
                    .filter(detalle -> detalle.getMovimiento().getTipoMovimiento() == TipoMovimiento.ENTRADA)
                    .map(detalle -> detalle.getMovimiento().getFecha())
                    .min(LocalDate::compareTo)
                    .orElse(null);

            if (fechaPrimeraProduccion == null || dto.fecha().isBefore(fechaPrimeraProduccion)) {
                String fechaReferencia = fechaPrimeraProduccion != null
                        ? fechaPrimeraProduccion.toString()
                        : "ninguna fecha registrada";
                throw new IllegalArgumentException(
                        "No se puede registrar la venta del producto '" + producto.getNombre() + "' en la fecha " +
                        dto.fecha() + " porque la primera producción registrada es del " + fechaReferencia +
                        ". Por favor, verifica las fechas de producción y venta."
                );
                }

                // Validar stock disponible en el lote específico
                double stockDisponibleEnLote = obtenerStockDisponibleEnLote(producto, venta.lote());
                if (stockDisponibleEnLote < venta.cantidad()) {
                    throw new IllegalArgumentException(
                        "Stock insuficiente en el lote '" + venta.lote() + "' para el producto '" + producto.getNombre() + 
                        "'. Stock disponible en lote: " + stockDisponibleEnLote + 
                        ", Cantidad solicitada: " + venta.cantidad()
                    );
                }

            // Validar que el lote haya sido creado en una fecha anterior o igual a la venta
            LocalDate fechaCreacionLote = producto.getMovimientos().stream()
                    .filter(detalle -> detalle.getMovimiento().getTipoMovimiento() == TipoMovimiento.ENTRADA)
                    .filter(detalle -> venta.lote().equals(detalle.getLote()))
                    .map(detalle -> detalle.getMovimiento().getFecha())
                    .min(LocalDate::compareTo)
                    .orElse(null);

            if (fechaCreacionLote == null) {
                throw new IllegalArgumentException(
                        "No se encontró la producción (lote '" + venta.lote() + "') del producto '" + producto.getNombre() +
                        "'. Verifica que el lote exista antes de registrar la venta."
                );
            }

            if (dto.fecha().isBefore(fechaCreacionLote)) {
                throw new IllegalArgumentException(
                        "No se puede vender unidades del lote '" + venta.lote() + "' del producto '" + producto.getNombre() +
                        "' en la fecha " + dto.fecha() + " porque el lote se produjo el " + fechaCreacionLote + "."
                    );
                }

            // ✅ VALIDACIÓN: Verificar que el lote no esté vencido
            LocalDate fechaVencimientoLote = obtenerFechaVencimientoLote(producto, venta.lote());
            if (fechaVencimientoLote != null && fechaVencimientoLote.isBefore(LocalDate.now())) {
                throw new IllegalArgumentException(
                    "No se puede vender unidades del lote '" + venta.lote() + "' del producto '" + producto.getNombre() +
                    "' porque el lote venció el " + fechaVencimientoLote + "."
                );
            }

                // Actualizar stock del producto
                producto.setStockActual(producto.getStockActual() - venta.cantidad());
                producto.setPrecioVenta(venta.precioVenta());
                productoRepository.save(producto);

                // Crear el detalle con el lote específico
                DetalleMovimientoProducto detalle = new DetalleMovimientoProducto(
                        venta.cantidad(),
                        producto
                );
                detalle.setLote(venta.lote()); // Usar el lote específico
                detalle.setFechaVencimiento(obtenerFechaVencimientoLote(producto, venta.lote()));

                movimiento.addDetalle(detalle);
            }

            return movimientoRepository.save(movimiento);
        } catch (Exception e) {
            System.err.println("Error en crearVentaPorLotes: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    /**
     * Obtiene el stock disponible en un lote específico
     */
    private double obtenerStockDisponibleEnLote(Producto producto, String lote) {
        double cantidadEntrada = producto.getMovimientos().stream()
                .filter(detalle -> detalle.getMovimiento().getTipoMovimiento() == TipoMovimiento.ENTRADA)
                .filter(detalle -> lote.equals(detalle.getLote()))
                .mapToDouble(DetalleMovimientoProducto::getCantidad)
                .sum();

        double cantidadVendida = producto.getMovimientos().stream()
                .filter(detalle -> detalle.getMovimiento().getTipoMovimiento() == TipoMovimiento.SALIDA)
                .filter(detalle -> lote.equals(detalle.getLote()))
                .mapToDouble(DetalleMovimientoProducto::getCantidad)
                .sum();

        return cantidadEntrada - cantidadVendida;
    }

    /**
     * Obtiene la fecha de vencimiento de un lote específico
     */
    private LocalDate obtenerFechaVencimientoLote(Producto producto, String lote) {
        return producto.getMovimientos().stream()
                .filter(detalle -> detalle.getMovimiento().getTipoMovimiento() == TipoMovimiento.ENTRADA)
                .filter(detalle -> lote.equals(detalle.getLote()))
                .map(DetalleMovimientoProducto::getFechaVencimiento)
                .findFirst()
                .orElse(null);
    }

    /**
     * ✅ NUEVO: Valida que los insumos tengan stock suficiente en la fecha del movimiento de producción
     */
    private void validarStockHistoricoInsumosParaProduccion(Producto producto, double cantidadProducto, LocalDate fechaProduccion) {
        if (producto.getReceta() == null || producto.getReceta().getDetalles() == null) {
            return; // No hay receta, no hay nada que validar
        }

        System.out.println("🕐 Validando stock histórico de insumos para producción en fecha: " + fechaProduccion);

        for (InsumoReceta detalleReceta : producto.getReceta().getDetalles()) {
            Insumo insumo = detalleReceta.getInsumo();
            double cantidadInsumoNecesaria = detalleReceta.getCantidad() * cantidadProducto;

            // Calcular el stock que tenía el insumo en la fecha del movimiento de producción
            double stockEnFecha = calcularStockInsumoEnFecha(insumo, fechaProduccion);

            System.out.println(String.format("  📦 Insumo '%s': Stock en %s = %.2f, Necesario: %.2f",
                    insumo.getNombre(), fechaProduccion, stockEnFecha, cantidadInsumoNecesaria));

            if (stockEnFecha < cantidadInsumoNecesaria) {
                throw new IllegalArgumentException(
                    String.format("No es posible realizar la producción en la fecha %s. " +
                                    "El insumo '%s' no tenía suficiente stock disponible en esa fecha. " +
                                    "Stock disponible en la fecha seleccionada: %.2f %s, cantidad necesaria: %.2f %s. " +
                                    "Por favor, asegúrate de que los insumos hayan sido adquiridos o ensamblados antes de la fecha de producción.",
                            fechaProduccion,
                            insumo.getNombre(),
                            stockEnFecha,
                            insumo.getUnidadMedida().toString().toLowerCase(),
                            cantidadInsumoNecesaria,
                            insumo.getUnidadMedida().toString().toLowerCase())
                );
            }
        }

        System.out.println("✅ Validación de stock histórico de insumos exitosa");
    }

    /**
     * ✅ NUEVO: Calcula el stock que tenía un insumo en una fecha específica
     * Considera todos los movimientos hasta esa fecha (entradas y salidas)
     */
    private double calcularStockInsumoEnFecha(Insumo insumo, LocalDate fecha) {
        double stock = 0.0;

        // Recorrer todos los movimientos del insumo hasta la fecha indicada
        for (DetalleMovimientoInsumo detalle : insumo.getMovimientos()) {
            LocalDate fechaMovimiento = detalle.getMovimiento().getFecha();

            // Solo considerar movimientos ANTES O EN la fecha especificada
            if (fechaMovimiento.isBefore(fecha) || fechaMovimiento.isEqual(fecha)) {
                TipoMovimiento tipo = detalle.getMovimiento().getTipoMovimiento();

                if (tipo == TipoMovimiento.ENTRADA) {
                    stock += detalle.getCantidad();
                } else if (tipo == TipoMovimiento.SALIDA) {
                    stock -= detalle.getCantidad();
                }
            }
        }

        return stock;
    }

    /**
     * Resta los insumos necesarios de la receta del producto
     * ✅ ACTUALIZADO: Ahora recibe la fecha para validaciones adicionales
     */
    private void restarInsumosDeReceta(Producto producto, double cantidadProducto, LocalDate fechaProduccion) {
        if (producto.getReceta() == null || producto.getReceta().getDetalles() == null) {
            return; // No hay receta, no hay nada que restar
        }

        for (InsumoReceta detalleReceta : producto.getReceta().getDetalles()) {
            Insumo insumo = detalleReceta.getInsumo();
            double cantidadInsumoNecesaria = detalleReceta.getCantidad() * cantidadProducto;

            // Validar stock suficiente del insumo (validación adicional de seguridad)
            if (insumo.getStockActual() < cantidadInsumoNecesaria) {
                throw new IllegalArgumentException(
                    "Stock insuficiente del insumo '" + insumo.getNombre() + 
                    "' para producir " + cantidadProducto + " unidades de '" + producto.getNombre() + 
                    "'. Stock disponible: " + insumo.getStockActual() + 
                    ", Cantidad necesaria: " + cantidadInsumoNecesaria
                );
            }

            // Restar la cantidad del insumo
            insumo.setStockActual(insumo.getStockActual() - cantidadInsumoNecesaria);
            insumoRepository.save(insumo);
        }
    }

    /**
     * Calcula el stock disponible de un producto en una fecha específica
     * Considera todos los movimientos hasta esa fecha
     */
    private double calcularStockDisponibleEnFecha(Producto producto, LocalDate fecha) {
        double stockInicial = 0.0;
        
        // Obtener todos los movimientos del producto hasta la fecha especificada
        List<DetalleMovimientoProducto> movimientosHastaFecha = producto.getMovimientos().stream()
                .filter(detalle -> detalle.getMovimiento().getFecha().isBefore(fecha) || 
                                 detalle.getMovimiento().getFecha().isEqual(fecha))
                .sorted(Comparator.comparing(detalle -> detalle.getMovimiento().getFecha()))
                .collect(Collectors.toList());
        
        // Calcular stock acumulado
        for (DetalleMovimientoProducto detalle : movimientosHastaFecha) {
            if (detalle.getMovimiento().getTipoMovimiento() == TipoMovimiento.ENTRADA) {
                stockInicial += detalle.getCantidad();
            } else if (detalle.getMovimiento().getTipoMovimiento() == TipoMovimiento.SALIDA) {
                stockInicial -= detalle.getCantidad();
            }
        }
        
        return stockInicial;
    }

    /**
     * Obtiene el stock disponible por lotes para un producto
     */
    public List<StockPorLoteDTO> obtenerStockPorLotes(Long productoId) {
        Producto producto = productoRepository.findById(productoId)
                .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado: " + productoId));

        return producto.getMovimientos().stream()
                .filter(detalle -> detalle.getMovimiento().getTipoMovimiento() == TipoMovimiento.ENTRADA)
                .collect(Collectors.groupingBy(
                    DetalleMovimientoProducto::getLote,
                    Collectors.summingDouble(DetalleMovimientoProducto::getCantidad)
                ))
                .entrySet().stream()
                .map(entry -> {
                    String lote = entry.getKey();
                    double cantidadEntrada = entry.getValue();
                    
                    // Calcular cantidad vendida de este lote
                    double cantidadVendida = producto.getMovimientos().stream()
                            .filter(detalle -> detalle.getMovimiento().getTipoMovimiento() == TipoMovimiento.SALIDA)
                            .filter(detalle -> lote.equals(detalle.getLote()))
                            .mapToDouble(DetalleMovimientoProducto::getCantidad)
                            .sum();
                    
                    double stockDisponible = cantidadEntrada - cantidadVendida;
                    
                    // Obtener fecha de vencimiento del primer movimiento de entrada con este lote
                    LocalDate fechaVencimiento = producto.getMovimientos().stream()
                            .filter(detalle -> detalle.getMovimiento().getTipoMovimiento() == TipoMovimiento.ENTRADA)
                            .filter(detalle -> lote.equals(detalle.getLote()))
                            .map(DetalleMovimientoProducto::getFechaVencimiento)
                            .findFirst()
                            .orElse(null);
                    
                    return new StockPorLoteDTO(lote, stockDisponible, fechaVencimiento);
                })
                .filter(stock -> stock.cantidadDisponible() > 0)
                .sorted(Comparator.comparing(StockPorLoteDTO::fechaVencimiento))
                .collect(Collectors.toList());
    }

    /**
     * ✅ NUEVO: Valida que una fecha sea razonable (no muy antigua ni muy futura)
     */
    private void validarFecha(LocalDate fecha, String tipoMovimiento) {
        if (fecha == null) {
            throw new IllegalArgumentException("La fecha no puede ser nula para " + tipoMovimiento);
        }
        
        LocalDate hoy = LocalDate.now();
        LocalDate fechaMinima = hoy.minusYears(10); // No más de 10 años atrás
        LocalDate fechaMaxima = hoy.plusMonths(1);  // No más de 1 mes adelante
        
        if (fecha.isBefore(fechaMinima)) {
            throw new IllegalArgumentException(
                "La fecha no puede ser anterior a " + fechaMinima + 
                ". Por favor, verifica la fecha del movimiento."
            );
        }
        
        if (fecha.isAfter(fechaMaxima)) {
            throw new IllegalArgumentException(
                "La fecha no puede ser posterior a " + fechaMaxima + 
                ". Por favor, verifica la fecha del movimiento."
            );
        }
    }
}

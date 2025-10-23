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
import com.Latti.stock.repositories.MovimientoProductoLoteRepository;
import com.Latti.stock.repositories.ProductoRepository;
import com.Latti.stock.repositories.InsumoRepository;
import com.Latti.stock.service.MovimientoProductoLoteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.stream.Collectors;

@Service
public class MovimientoProductoLoteServiceImplements implements MovimientoProductoLoteService {

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private MovimientoProductoLoteRepository movimientoRepository;

    @Autowired
    private InsumoRepository insumoRepository;

    @Override
    @Transactional
    public MovimientoProductoLote crearMovimientoProducto(CrearMovimientoProductoDTO dto) {
        try {
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
                    // Validar stock disponible en la fecha del movimiento
                    double stockDisponibleEnFecha = calcularStockDisponibleEnFecha(producto, dto.fecha());
                    if (stockDisponibleEnFecha < d.cantidad()) {
                        throw new IllegalArgumentException(
                            "Stock insuficiente para el producto '" + producto.getNombre() + 
                            "' en la fecha " + dto.fecha() + 
                            ". Stock disponible en esa fecha: " + stockDisponibleEnFecha + 
                            ", Cantidad solicitada: " + d.cantidad()
                        );
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
                    producto.setStockActual(producto.getStockActual() + d.cantidad());
                    
                    // Para ENTRADA (producción): restar insumos de la receta
                    if (producto.getReceta() != null) {
                        restarInsumosDeReceta(producto, d.cantidad());
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
                
                // Generar lote automáticamente para movimientos de ENTRADA
                if (dto.tipoMovimiento() == TipoMovimiento.ENTRADA) {
                    // El lote se generará automáticamente cuando se guarde el movimiento
                    // y se tenga acceso al ID del movimiento
                }

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
    public MovimientoProductoLote eliminarMovimientoProducto(Long id) {
        System.out.println("🗑️ BACKEND: Intentando eliminar movimiento de producto con ID: " + id);
        
        MovimientoProductoLote movimiento = movimientoRepository.findById(id)
                .orElseThrow(() -> {
                    System.out.println("❌ BACKEND: Movimiento de producto con ID " + id + " no encontrado");
                    return new IllegalArgumentException("Movimiento no encontrado");
                });
        
        System.out.println("✅ BACKEND: Movimiento encontrado: " + movimiento.getId() + " - " + movimiento.getDescripcion());

        // Lista para restaurar insumos después de eliminar el movimiento
        List<Object[]> insumosParaRestaurar = new ArrayList<>();

        // Revertir cambios en cada producto
        for (DetalleMovimientoProducto detalle : movimiento.getDetalles()) {
            Producto producto = detalle.getProducto();
            
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
                        double cantidadInsumoARestaurar = detalleReceta.getCantidad() * detalle.getCantidad();
                        insumosParaRestaurar.add(new Object[]{insumo.getId(), cantidadInsumoARestaurar});
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

                // Validar stock disponible en el lote específico
                double stockDisponibleEnLote = obtenerStockDisponibleEnLote(producto, venta.lote());
                if (stockDisponibleEnLote < venta.cantidad()) {
                    throw new IllegalArgumentException(
                        "Stock insuficiente en el lote '" + venta.lote() + "' para el producto '" + producto.getNombre() + 
                        "'. Stock disponible en lote: " + stockDisponibleEnLote + 
                        ", Cantidad solicitada: " + venta.cantidad()
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
     * Resta los insumos necesarios de la receta del producto
     */
    private void restarInsumosDeReceta(Producto producto, double cantidadProducto) {
        if (producto.getReceta() == null || producto.getReceta().getDetalles() == null) {
            return; // No hay receta, no hay nada que restar
        }

        for (InsumoReceta detalleReceta : producto.getReceta().getDetalles()) {
            Insumo insumo = detalleReceta.getInsumo();
            double cantidadInsumoNecesaria = detalleReceta.getCantidad() * cantidadProducto;

            // Validar stock suficiente del insumo
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
}

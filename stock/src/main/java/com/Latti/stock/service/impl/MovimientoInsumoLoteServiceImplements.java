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
import com.Latti.stock.modules.MovimientoProductoLote;
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
                                        det.getPrecioTotal(),
                                        det.getEnsambleId()
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

        // ✅ NUEVA VALIDACIÓN: Verificar si es parte de un ensamble
        if (esMovimientoDeEnsamble(id)) {
            throw new IllegalArgumentException(
                "No se puede eliminar este movimiento porque es parte de un ensamble de insumo compuesto. " +
                "Para deshacer un ensamble, debe eliminar el insumo compuesto resultante primero."
            );
        }

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

            // Condición 2: El insumo NO se ha usado en producción de productos DESPUÉS de este movimiento
            for (DetalleMovimientoInsumo detalle : movimiento.getDetalles()) {
                Insumo insumo = detalle.getInsumo();
                
                // Verificar si hay movimientos de productos que usen este insumo DESPUÉS de la fecha del movimiento
                boolean hayProduccionPosterior = verificarUsoEnProduccionPosterior(insumo, movimiento.getFecha());
                    
                    if (hayProduccionPosterior) {
                        detallesValidacion.add("El insumo '" + insumo.getNombre() + 
                        "' ha sido usado en la producción de productos después de este movimiento");
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

            // Condición 4: Validación especial para movimientos de ensamble
            if (esMovimientoDeEnsamble(movimientoId)) {
                // Obtener el ensambleId del movimiento
                String ensambleId = movimiento.getDetalles().stream()
                        .filter(d -> d.getEnsambleId() != null && !d.getEnsambleId().trim().isEmpty())
                        .map(DetalleMovimientoInsumo::getEnsambleId)
                        .findFirst()
                        .orElse(null);
                
                if (ensambleId != null) {
                    // Si es un movimiento de SALIDA con ensambleId (insumo simple usado en ensamble)
                    // NO se puede editar directamente (debe editarse desde el ensamble)
                    if (movimiento.getTipoMovimiento() == TipoMovimiento.SALIDA) {
                        detallesValidacion.add("Este movimiento es parte de un ensamble. " +
                                "Para editarlo, debes editar el movimiento de ensamble del insumo compuesto relacionado.");
                    } 
                    // Si es un movimiento de ENTRADA con ensambleId (insumo compuesto ensamblado)
                    // Permitir editar SOLO si no se ha usado para crear productos
                    else if (movimiento.getTipoMovimiento() == TipoMovimiento.ENTRADA) {
                        // Verificar si el insumo compuesto se usó para crear productos DESPUÉS de este movimiento
                        for (DetalleMovimientoInsumo detalle : movimiento.getDetalles()) {
                            Insumo insumoCompuesto = detalle.getInsumo();
                            
                            // Verificar si es un insumo compuesto
                            if (insumoCompuesto != null && insumoCompuesto.esCompuesto()) {
                                boolean seUsoEnProduccion = verificarUsoEnProduccionPosterior(insumoCompuesto, movimiento.getFecha());
                                if (seUsoEnProduccion) {
                                    detallesValidacion.add("Este insumo compuesto ya se ha usado para crear productos después de este ensamble. " +
                                            "No se puede editar porque afectaría el historial de producción.");
                                }
                            }
                        }
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
            System.out.println("🔍 === SERVICIO: INICIO DE EDICIÓN ===");
            System.out.println("📦 ID del movimiento: " + dto.id());
            System.out.println("📋 Detalles a editar: " + dto.detalles());
            System.out.println("📋 Cantidad de detalles: " + (dto.detalles() != null ? dto.detalles().size() : "null"));
            
            // Primero validar que se puede editar
            System.out.println("🔄 Validando si se puede editar el movimiento...");
            ValidacionEdicionDTO validacion = validarEdicionMovimiento(dto.id());
            System.out.println("✅ Validación completada. Puede editar: " + validacion.puedeEditar());
            if (!validacion.puedeEditar()) {
                System.err.println("❌ No se puede editar: " + validacion.razon());
                throw new IllegalArgumentException("No se puede editar el movimiento: " + validacion.razon());
            }

            // Buscar movimiento existente
            MovimientoInsumoLote movimiento = movimientoRepository.findById(dto.id())
                    .orElseThrow(() -> new IllegalArgumentException("Movimiento no encontrado"));

            // ✅ NUEVO: Si es un movimiento de ENTRADA con ensambleId, guardar el ensambleId y la cantidad original
            String ensambleId = null;
            double cantidadOriginal = 0.0;
            boolean esMovimientoEnsamble = esMovimientoDeEnsamble(dto.id()) && 
                                         movimiento.getTipoMovimiento() == TipoMovimiento.ENTRADA;
            
            if (esMovimientoEnsamble) {
                ensambleId = movimiento.getDetalles().stream()
                        .filter(d -> d.getEnsambleId() != null && !d.getEnsambleId().trim().isEmpty())
                        .map(DetalleMovimientoInsumo::getEnsambleId)
                        .findFirst()
                        .orElse(null);
                
                if (movimiento.getDetalles().size() > 0) {
                    cantidadOriginal = movimiento.getDetalles().get(0).getCantidad();
                }
            }

            // Revertir stock del movimiento original
            for (DetalleMovimientoInsumo detalle : movimiento.getDetalles()) {
                Insumo insumo = detalle.getInsumo();
                if (movimiento.getTipoMovimiento() == TipoMovimiento.ENTRADA) {
                    insumo.setStockActual(insumo.getStockActual() - detalle.getCantidad());
                } else {
                    insumo.setStockActual(insumo.getStockActual() + detalle.getCantidad());
                }
                insumoRepository.save(insumo);
            }
            
            // ✅ NUEVO: Si es un movimiento de ensamble, revertir también los movimientos de salida relacionados
            if (esMovimientoEnsamble && ensambleId != null) {
                System.out.println("🔄 Revertiendo movimientos de salida relacionados con ensambleId: " + ensambleId);
                List<DetalleMovimientoInsumo> movimientosRelacionados = detalleMovimientoInsumoRepository.findByEnsambleId(ensambleId);
                
                for (DetalleMovimientoInsumo detalleRelacionado : movimientosRelacionados) {
                    // Solo revertir los movimientos de SALIDA (insumos simples usados en el ensamble)
                    if (detalleRelacionado.getMovimiento().getTipoMovimiento() == TipoMovimiento.SALIDA) {
                        Insumo insumoSimple = detalleRelacionado.getInsumo();
                        // Revertir el stock (devolver lo que se había quitado)
                        insumoSimple.setStockActual(insumoSimple.getStockActual() + detalleRelacionado.getCantidad());
                        insumoRepository.save(insumoSimple);
                        System.out.println("  ✅ Revertido stock de " + insumoSimple.getNombre() + ": +" + detalleRelacionado.getCantidad());
                    }
                }
            }

            // Actualizar datos básicos
            movimiento.setFecha(dto.fecha());
            movimiento.setDescripcion(dto.descripcion());
            movimiento.setTipoMovimiento(dto.tipoMovimiento());

            // ✅ PASO 1: Eliminar TODOS los detalles antiguos con query directa
            int cantidadDetallesAntiguos = movimiento.getDetalles().size();
            System.out.println("🗑️ Eliminando " + cantidadDetallesAntiguos + " detalles antiguos del movimiento " + dto.id() + "...");
            
            // Vaciar la lista primero (para romper la relación en memoria)
            movimiento.getDetalles().clear();
            
            // Eliminar DIRECTAMENTE de la BD usando query personalizada
            detalleMovimientoInsumoRepository.deleteByMovimientoId(dto.id());
            detalleMovimientoInsumoRepository.flush();
            System.out.println("✅ Detalles antiguos eliminados de la BD");
            
            // ✅ PASO 2: Crear y agregar los nuevos detalles
            System.out.println("➕ Agregando " + dto.detalles().size() + " detalles nuevos...");
            List<Long> insumosParaRecalcular = new ArrayList<>();
            
            for (DetalleMovimientoInsumoDTO detalleDto : dto.detalles()) {
                Insumo insumo = insumoRepository.findById(detalleDto.insumoId())
                        .orElseThrow(() -> new IllegalArgumentException("Insumo no encontrado"));

                if (detalleDto.cantidad() <= 0) {
                    throw new IllegalArgumentException("La cantidad debe ser mayor a 0");
                }
                if (dto.tipoMovimiento() == TipoMovimiento.ENTRADA && detalleDto.precio() <= 0) {
                    throw new IllegalArgumentException("El precio debe ser mayor a 0");
                }

                // Aplicar nuevo stock
                if (dto.tipoMovimiento() == TipoMovimiento.ENTRADA) {
                    insumo.setStockActual(insumo.getStockActual() + detalleDto.cantidad());
                    
                    // ✅ NUEVO: Si es un insumo compuesto editando un ensamble, recalcular precio basado en componentes
                    if (esMovimientoEnsamble && insumo.esCompuesto()) {
                        // El precio ya viene calculado en el DTO, solo actualizar precio por unidad
                        insumo.setPrecioDeCompra(detalleDto.precio() / detalleDto.cantidad());
                        System.out.println("  💰 Precio actualizado para insumo compuesto " + insumo.getNombre() + 
                                         ": $" + (detalleDto.precio() / detalleDto.cantidad()) + " por unidad");
                    } else {
                        insumo.setPrecioDeCompra(detalleDto.precio() / detalleDto.cantidad());
                    }
                    
                    insumosParaRecalcular.add(insumo.getId());
                } else {
                    insumo.setStockActual(insumo.getStockActual() - detalleDto.cantidad());
                }
                insumoRepository.save(insumo);

                // Crear nuevo detalle
                DetalleMovimientoInsumo nuevoDetalle = new DetalleMovimientoInsumo(detalleDto.cantidad());
                nuevoDetalle.setInsumo(insumo);
                nuevoDetalle.setMovimiento(movimiento);
                if (dto.tipoMovimiento() == TipoMovimiento.ENTRADA) {
                    nuevoDetalle.setPrecioTotal(detalleDto.precio());
                }
                
                // ✅ NUEVO: Si es un movimiento de ensamble, preservar el ensambleId
                if (esMovimientoEnsamble && ensambleId != null) {
                    nuevoDetalle.setEnsambleId(ensambleId);
                    System.out.println("  ✅ Preservado ensambleId: " + ensambleId);
                }
                
                movimiento.getDetalles().add(nuevoDetalle);
            }

            // ✅ PASO 3: Guardar movimiento con nuevos detalles
            MovimientoInsumoLote movimientoActualizado = movimientoRepository.saveAndFlush(movimiento);
            System.out.println("✅ Movimiento actualizado con " + movimientoActualizado.getDetalles().size() + " detalles");
            
            // ✅ NUEVO: Si es un movimiento de ensamble, actualizar proporcionalmente los movimientos de salida relacionados
            if (esMovimientoEnsamble && ensambleId != null && dto.detalles().size() > 0) {
                double cantidadNueva = dto.detalles().get(0).cantidad();
                double factorProporcion = cantidadNueva / cantidadOriginal;
                
                System.out.println("🔄 Actualizando movimientos de salida relacionados:");
                System.out.println("  📊 Cantidad original: " + cantidadOriginal);
                System.out.println("  📊 Cantidad nueva: " + cantidadNueva);
                System.out.println("  📊 Factor de proporción: " + factorProporcion);
                
                List<DetalleMovimientoInsumo> movimientosRelacionados = detalleMovimientoInsumoRepository.findByEnsambleId(ensambleId);
                
                for (DetalleMovimientoInsumo detalleRelacionado : movimientosRelacionados) {
                    // Solo actualizar los movimientos de SALIDA (insumos simples usados en el ensamble)
                    if (detalleRelacionado.getMovimiento().getTipoMovimiento() == TipoMovimiento.SALIDA) {
                        Insumo insumoSimple = detalleRelacionado.getInsumo();
                        double cantidadOriginalSalida = detalleRelacionado.getCantidad();
                        double cantidadNuevaSalida = cantidadOriginalSalida * factorProporcion;
                        
                        // Actualizar la cantidad del detalle
                        detalleRelacionado.setCantidad(cantidadNuevaSalida);
                        
                        // Actualizar el stock del insumo simple
                        // La diferencia es: (cantidadNuevaSalida - cantidadOriginalSalida)
                        double diferencia = cantidadNuevaSalida - cantidadOriginalSalida;
                        insumoSimple.setStockActual(insumoSimple.getStockActual() - diferencia);
                        
                        detalleMovimientoInsumoRepository.save(detalleRelacionado);
                        insumoRepository.save(insumoSimple);
                        
                        System.out.println("  ✅ Actualizado movimiento de salida de " + insumoSimple.getNombre() + 
                                         ": " + cantidadOriginalSalida + " → " + cantidadNuevaSalida + 
                                         " (diferencia: " + diferencia + ")");
                    }
                }
            }

            // Recalcular precios de inversión de productos
            for (Long insumoId : insumosParaRecalcular) {
                recalcularPrecioInversionProductos(insumoId);
            }

            return movimientoActualizado;

        } catch (IllegalArgumentException e) {
            System.err.println("❌ Error de validación en editarMovimientoInsumo: " + e.getMessage());
            System.err.println("❌ Stack trace:");
            e.printStackTrace();
            throw e;
        } catch (Exception e) {
            System.err.println("💥 Error inesperado en editarMovimientoInsumo: " + e.getMessage());
            System.err.println("💥 Tipo de excepción: " + e.getClass().getName());
            System.err.println("💥 Stack trace completo:");
            e.printStackTrace();
            throw e;
        }
    }

    // ✅ NUEVO: Métodos para insumos compuestos
    @Override
    @Transactional
    public void crearMovimientoEntrada(Long insumoId, double cantidad, double precioTotal, LocalDate fecha, String descripcion) {
        Insumo insumo = insumoRepository.findById(insumoId)
                .orElseThrow(() -> new IllegalArgumentException("Insumo no encontrado: " + insumoId));

        // Crear el movimiento
        MovimientoInsumoLote movimiento = new MovimientoInsumoLote(fecha, descripcion, TipoMovimiento.ENTRADA);
        
        // Crear el detalle
        DetalleMovimientoInsumo detalle = new DetalleMovimientoInsumo(cantidad);
        detalle.setInsumo(insumo);
        detalle.setPrecioTotal(precioTotal);
        movimiento.addDetalle(detalle);

        // Actualizar stock y precio del insumo
        insumo.setStockActual(insumo.getStockActual() + cantidad);
        
        // Calcular precio por unidad
        double precioPorUnidad = precioTotal / cantidad;
        
        // Solo actualizar precio si es mayor (peor) que el actual
        if (insumo.getPrecioDeCompra() == 0 || precioPorUnidad > insumo.getPrecioDeCompra()) {
            insumo.setPrecioDeCompra(precioPorUnidad);
        }

        // Guardar todo
        insumoRepository.save(insumo);
        movimientoRepository.save(movimiento);
    }

    @Override
    @Transactional
    public void crearMovimientoSalida(Long insumoId, double cantidad, LocalDate fecha, String descripcion) {
        Insumo insumo = insumoRepository.findById(insumoId)
                .orElseThrow(() -> new IllegalArgumentException("Insumo no encontrado: " + insumoId));

        // Validar stock suficiente
        if (insumo.getStockActual() < cantidad) {
            throw new IllegalArgumentException(
                    String.format("Stock insuficiente para el insumo '%s'. Stock actual: %.2f, Cantidad solicitada: %.2f",
                            insumo.getNombre(), insumo.getStockActual(), cantidad)
            );
        }

        // Crear el movimiento
        MovimientoInsumoLote movimiento = new MovimientoInsumoLote(fecha, descripcion, TipoMovimiento.SALIDA);
        
        // Crear el detalle
        DetalleMovimientoInsumo detalle = new DetalleMovimientoInsumo(cantidad);
        detalle.setInsumo(insumo);
        movimiento.addDetalle(detalle);

        // Actualizar stock del insumo
        insumo.setStockActual(insumo.getStockActual() - cantidad);

        // Guardar todo
        insumoRepository.save(insumo);
        movimientoRepository.save(movimiento);
    }

    // ✅ NUEVO: Método para crear movimiento de entrada con ensambleId
    @Override
    @Transactional
    public void crearMovimientoEntradaConEnsamble(Long insumoId, double cantidad, double precioTotal, LocalDate fecha, String descripcion, String ensambleId) {
        Insumo insumo = insumoRepository.findById(insumoId)
                .orElseThrow(() -> new IllegalArgumentException("Insumo no encontrado: " + insumoId));

        // Crear el movimiento
        MovimientoInsumoLote movimiento = new MovimientoInsumoLote(fecha, descripcion, TipoMovimiento.ENTRADA);
        
        // Crear el detalle con ensambleId
        DetalleMovimientoInsumo detalle = new DetalleMovimientoInsumo(cantidad);
        detalle.setInsumo(insumo);
        detalle.setPrecioTotal(precioTotal);
        detalle.setEnsambleId(ensambleId); // ✅ Marcar como parte de un ensamble
        movimiento.addDetalle(detalle);

        // Actualizar stock y precio del insumo
        insumo.setStockActual(insumo.getStockActual() + cantidad);
        
        // Calcular precio por unidad
        double precioPorUnidad = precioTotal / cantidad;
        
        // Solo actualizar precio si es mayor (peor) que el actual
        if (insumo.getPrecioDeCompra() == 0 || precioPorUnidad > insumo.getPrecioDeCompra()) {
            insumo.setPrecioDeCompra(precioPorUnidad);
        }

        // Guardar todo
        insumoRepository.save(insumo);
        movimientoRepository.save(movimiento);
    }

    // ✅ NUEVO: Método para crear movimiento de salida con ensambleId
    @Override
    @Transactional
    public void crearMovimientoSalidaConEnsamble(Long insumoId, double cantidad, LocalDate fecha, String descripcion, String ensambleId) {
        Insumo insumo = insumoRepository.findById(insumoId)
                .orElseThrow(() -> new IllegalArgumentException("Insumo no encontrado: " + insumoId));

        // Validar stock suficiente
        if (insumo.getStockActual() < cantidad) {
            throw new IllegalArgumentException(
                    String.format("Stock insuficiente para el insumo '%s'. Stock actual: %.2f, Cantidad solicitada: %.2f",
                            insumo.getNombre(), insumo.getStockActual(), cantidad)
            );
        }

        // Crear el movimiento
        MovimientoInsumoLote movimiento = new MovimientoInsumoLote(fecha, descripcion, TipoMovimiento.SALIDA);
        
        // Crear el detalle con ensambleId
        DetalleMovimientoInsumo detalle = new DetalleMovimientoInsumo(cantidad);
        detalle.setInsumo(insumo);
        detalle.setEnsambleId(ensambleId); // ✅ Marcar como parte de un ensamble
        movimiento.addDetalle(detalle);

        // Actualizar stock del insumo
        insumo.setStockActual(insumo.getStockActual() - cantidad);

        // Guardar todo
        insumoRepository.save(insumo);
        movimientoRepository.save(movimiento);
    }

    // ✅ NUEVO: Método para validar si un movimiento es parte de un ensamble
    @Override
    public boolean esMovimientoDeEnsamble(Long movimientoId) {
        MovimientoInsumoLote movimiento = movimientoRepository.findById(movimientoId)
                .orElseThrow(() -> new IllegalArgumentException("Movimiento no encontrado"));

        // Un movimiento es parte de un ensamble si alguno de sus detalles tiene ensambleId
        return movimiento.getDetalles().stream()
                .anyMatch(detalle -> detalle.getEnsambleId() != null && !detalle.getEnsambleId().trim().isEmpty());
    }

    /**
     * Verifica si un insumo ha sido usado en producción de productos después de una fecha específica
     * Funciona tanto para insumos simples (usados en recetas) como para insumos compuestos (usados directamente)
     */
    private boolean verificarUsoEnProduccionPosterior(Insumo insumo, LocalDate fechaMovimiento) {
        // Si es un insumo compuesto, verificar si se usó directamente en producción
        if (insumo.esCompuesto()) {
            // Verificar si hay movimientos de salida de este insumo compuesto después de la fecha
            // que indiquen que se usó para crear productos
            List<DetalleMovimientoInsumo> salidasPosteriores = insumo.getMovimientos().stream()
                    .filter(d -> d.getMovimiento().getTipoMovimiento() == TipoMovimiento.SALIDA &&
                               d.getMovimiento().getFecha().isAfter(fechaMovimiento))
                    .collect(Collectors.toList());
            
            // Si hay salidas posteriores, es probable que se haya usado
            // Pero también verificamos si hay movimientos de productos que usen este insumo compuesto
            // (aunque esto es menos común, ya que los productos normalmente usan insumos simples)
            return !salidasPosteriores.isEmpty();
        }
        
        // Para insumos simples, verificar si se usaron en recetas de productos
        List<Producto> productosQueUsanInsumo = productoRepository.findAll().stream()
                .filter(producto -> producto.getReceta() != null && 
                        producto.getReceta().getDetalles().stream()
                                .anyMatch(d -> d.getInsumo().getId().equals(insumo.getId())))
                .toList();

        // Para cada producto, verificar si tiene movimientos de entrada después de la fecha del movimiento de insumo
        for (Producto producto : productosQueUsanInsumo) {
            boolean tieneProduccionPosterior = producto.getMovimientos().stream()
                    .anyMatch(detalleMovimiento -> {
                        MovimientoProductoLote movimientoProducto = detalleMovimiento.getMovimiento();
                        return movimientoProducto.getTipoMovimiento() == TipoMovimiento.ENTRADA &&
                               movimientoProducto.getFecha().isAfter(fechaMovimiento);
                    });
            
            if (tieneProduccionPosterior) {
                return true; // El insumo se usó en producción después del movimiento
            }
        }
        
        return false; // No se usó en producción después del movimiento
    }


}

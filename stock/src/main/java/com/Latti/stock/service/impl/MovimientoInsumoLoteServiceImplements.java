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

            // Condición 4: No es un movimiento de ensamble (los movimientos de ensamble no se pueden editar)
            if (esMovimientoDeEnsamble(movimientoId)) {
                detallesValidacion.add("Este movimiento es parte de un ensamble de insumo compuesto y no se puede editar");
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

            System.out.println("🔄 Buscando movimiento en la base de datos...");
            MovimientoInsumoLote movimiento = movimientoRepository.findById(dto.id())
                    .orElseThrow(() -> new IllegalArgumentException("Movimiento no encontrado"));

            System.out.println("📦 Movimiento encontrado: " + movimiento.getId());
            System.out.println("📋 Detalles actuales ANTES de editar: " + movimiento.getDetalles().size());
            System.out.println("📋 Detalles actuales (detalle):");
            for (int i = 0; i < movimiento.getDetalles().size(); i++) {
                DetalleMovimientoInsumo det = movimiento.getDetalles().get(i);
                System.out.println("  [" + i + "] ID: " + det.getId() + 
                                 ", Insumo: " + (det.getInsumo() != null ? det.getInsumo().getNombre() : "null") + 
                                 ", Cantidad: " + det.getCantidad() + 
                                 ", PrecioTotal: " + det.getPrecioTotal());
            }

            // Revertir el movimiento original
            System.out.println("🔄 Revirtiendo movimiento original...");
            for (DetalleMovimientoInsumo detalle : movimiento.getDetalles()) {
                Insumo insumo = detalle.getInsumo();
                System.out.println("  - Revirtiendo insumo: " + insumo.getNombre() + " cantidad: " + detalle.getCantidad());
                
                if (movimiento.getTipoMovimiento() == TipoMovimiento.ENTRADA) {
                    insumo.setStockActual(insumo.getStockActual() - detalle.getCantidad());
                } else {
                    insumo.setStockActual(insumo.getStockActual() + detalle.getCantidad());
                }
                insumoRepository.save(insumo);
            }

            // ACTUALIZAR datos básicos del movimiento
            movimiento.setFecha(dto.fecha());
            movimiento.setDescripcion(dto.descripcion());
            movimiento.setTipoMovimiento(dto.tipoMovimiento());

            // ELIMINAR todos los detalles antiguos directamente del repositorio
            System.out.println("🗑️ === ELIMINANDO DETALLES ANTIGUOS ===");
            System.out.println("  - Cantidad de detalles a eliminar: " + movimiento.getDetalles().size());
            List<DetalleMovimientoInsumo> detallesAntiguos = new ArrayList<>(movimiento.getDetalles());
            
            System.out.println("  - Lista de detalles a eliminar:");
            for (int i = 0; i < detallesAntiguos.size(); i++) {
                DetalleMovimientoInsumo det = detallesAntiguos.get(i);
                System.out.println("    [" + i + "] ID: " + det.getId() + 
                                 ", Insumo: " + (det.getInsumo() != null ? det.getInsumo().getNombre() : "null"));
            }
            
            System.out.println("  - Eliminando cada detalle del repositorio...");
            for (DetalleMovimientoInsumo detalle : detallesAntiguos) {
                System.out.println("    🗑️ Eliminando detalle ID: " + detalle.getId());
                detalleMovimientoInsumoRepository.delete(detalle);
                System.out.println("    ✅ Detalle ID " + detalle.getId() + " eliminado del repositorio");
            }
            
            System.out.println("  - Limpiando lista de detalles del movimiento...");
            movimiento.getDetalles().clear();
            System.out.println("  - Lista limpiada. Cantidad de detalles en lista: " + movimiento.getDetalles().size());
            
            System.out.println("  - Guardando movimiento sin detalles (saveAndFlush)...");
            movimientoRepository.saveAndFlush(movimiento);
            System.out.println("  - ✅ Movimiento guardado sin detalles");
            
            // Verificar directamente en BD cuántos detalles quedan
            Long movimientoId = movimiento.getId(); // Capturar ID para usar en lambda
            System.out.println("  - 🔍 Verificando detalles en BD para movimiento ID: " + movimientoId);
            List<DetalleMovimientoInsumo> detallesEnBD = detalleMovimientoInsumoRepository.findAll()
                    .stream()
                    .filter(d -> d.getMovimiento() != null && d.getMovimiento().getId().equals(movimientoId))
                    .toList();
            System.out.println("  - 📊 Detalles encontrados en BD para este movimiento: " + detallesEnBD.size());
            if (detallesEnBD.size() > 0) {
                System.out.println("  - ⚠️ ADVERTENCIA: Aún hay detalles en BD:");
                for (DetalleMovimientoInsumo det : detallesEnBD) {
                    System.out.println("      - Detalle ID: " + det.getId() + 
                                     ", Insumo: " + (det.getInsumo() != null ? det.getInsumo().getNombre() : "null"));
                }
            }
            
            // RECARGAR el movimiento desde la BD para asegurar que los detalles se eliminaron
            System.out.println("🔄 Recargando movimiento desde BD después de eliminar detalles...");
            movimiento = movimientoRepository.findById(movimiento.getId())
                    .orElseThrow(() -> new IllegalArgumentException("Movimiento no encontrado después de eliminar detalles"));
            System.out.println("✅ Movimiento recargado. Detalles restantes en entidad: " + movimiento.getDetalles().size());
            if (movimiento.getDetalles().size() > 0) {
                System.out.println("  - ⚠️ ADVERTENCIA: La entidad aún tiene detalles:");
                for (int i = 0; i < movimiento.getDetalles().size(); i++) {
                    DetalleMovimientoInsumo det = movimiento.getDetalles().get(i);
                    System.out.println("    [" + i + "] ID: " + det.getId() + 
                                     ", Insumo: " + (det.getInsumo() != null ? det.getInsumo().getNombre() : "null"));
                }
            }

            // CREAR nuevos detalles (reemplazo completo)
            System.out.println("➕ === CREANDO NUEVOS DETALLES ===");
            System.out.println("  - Cantidad de detalles nuevos a crear: " + dto.detalles().size());
            List<Long> insumosParaRecalcular = new ArrayList<>();
            
            for (int i = 0; i < dto.detalles().size(); i++) {
                DetalleMovimientoInsumoDTO detalleDto = dto.detalles().get(i);
                System.out.println("  - [" + i + "] Procesando detalle: insumoId=" + detalleDto.insumoId() + 
                                 ", cantidad=" + detalleDto.cantidad() + ", precio=" + detalleDto.precio());
                
                Insumo insumo = insumoRepository.findById(detalleDto.insumoId())
                        .orElseThrow(() -> new IllegalArgumentException("Insumo no encontrado: " + detalleDto.insumoId()));
                System.out.println("    ✅ Insumo encontrado: " + insumo.getNombre());

                // Validaciones
                if (detalleDto.cantidad() <= 0) {
                    throw new IllegalArgumentException("La cantidad debe ser mayor a 0 para el insumo: " + insumo.getNombre());
                }

                if (dto.tipoMovimiento() == TipoMovimiento.ENTRADA && detalleDto.precio() <= 0) {
                    throw new IllegalArgumentException("El precio debe ser mayor a 0 para el insumo: " + insumo.getNombre());
                }

                // Aplicar cambios al stock
                System.out.println("    - Aplicando cambios al stock...");
                double stockAnterior = insumo.getStockActual();
                if (dto.tipoMovimiento() == TipoMovimiento.ENTRADA) {
                    insumo.setStockActual(insumo.getStockActual() + detalleDto.cantidad());
                    double precioPorUnidad = detalleDto.precio() / detalleDto.cantidad();
                    insumo.setPrecioDeCompra(precioPorUnidad);
                    insumosParaRecalcular.add(insumo.getId());
                    System.out.println("      - Stock: " + stockAnterior + " → " + insumo.getStockActual());
                    System.out.println("      - Precio: " + insumo.getPrecioDeCompra());
                } else {
                    insumo.setStockActual(insumo.getStockActual() - detalleDto.cantidad());
                    System.out.println("      - Stock: " + stockAnterior + " → " + insumo.getStockActual());
                }
                insumoRepository.save(insumo);
                System.out.println("    ✅ Insumo guardado");

                // Crear nuevo detalle
                System.out.println("    - Creando nuevo detalle...");
                DetalleMovimientoInsumo nuevoDetalle = new DetalleMovimientoInsumo(detalleDto.cantidad());
                nuevoDetalle.setInsumo(insumo);
                if (dto.tipoMovimiento() == TipoMovimiento.ENTRADA) {
                    nuevoDetalle.setPrecioTotal(detalleDto.precio());
                }
                
                System.out.println("    - Detalle creado: cantidad=" + nuevoDetalle.getCantidad() + 
                                 ", precioTotal=" + nuevoDetalle.getPrecioTotal());
                
                // Usar addDetalle() para manejar la relación bidireccional correctamente
                System.out.println("    - Agregando detalle al movimiento...");
                movimiento.addDetalle(nuevoDetalle);
                System.out.println("    ✅ Detalle agregado. Total detalles en movimiento: " + movimiento.getDetalles().size());
            }

            // Guardar el movimiento actualizado
            System.out.println("💾 === GUARDANDO MOVIMIENTO ACTUALIZADO ===");
            System.out.println("  - Detalles en movimiento ANTES de guardar: " + movimiento.getDetalles().size());
            for (int i = 0; i < movimiento.getDetalles().size(); i++) {
                DetalleMovimientoInsumo det = movimiento.getDetalles().get(i);
                System.out.println("    [" + i + "] Insumo: " + (det.getInsumo() != null ? det.getInsumo().getNombre() : "null") + 
                                 ", Cantidad: " + det.getCantidad() + 
                                 ", PrecioTotal: " + det.getPrecioTotal());
            }
            
            MovimientoInsumoLote movimientoActualizado = movimientoRepository.save(movimiento);
            System.out.println("✅ Movimiento guardado con ID: " + movimientoActualizado.getId());
            
            // Recargar desde BD para ver el estado final
            System.out.println("🔄 Recargando movimiento final desde BD...");
            MovimientoInsumoLote movimientoFinal = movimientoRepository.findById(movimientoActualizado.getId())
                    .orElseThrow(() -> new IllegalArgumentException("Movimiento no encontrado después de guardar"));
            
            System.out.println("📋 === DETALLES FINALES ===");
            System.out.println("  - Cantidad de detalles finales: " + movimientoFinal.getDetalles().size());
            for (int i = 0; i < movimientoFinal.getDetalles().size(); i++) {
                DetalleMovimientoInsumo det = movimientoFinal.getDetalles().get(i);
                System.out.println("    [" + i + "] ID: " + det.getId() + 
                                 ", Insumo: " + (det.getInsumo() != null ? det.getInsumo().getNombre() : "null") + 
                                 ", Cantidad: " + det.getCantidad() + 
                                 ", PrecioTotal: " + det.getPrecioTotal());
            }
            
            // Verificar directamente en BD
            Long movimientoFinalId = movimientoFinal.getId(); // Capturar ID para usar en lambda
            List<DetalleMovimientoInsumo> detallesFinalesEnBD = detalleMovimientoInsumoRepository.findAll()
                    .stream()
                    .filter(d -> d.getMovimiento() != null && d.getMovimiento().getId().equals(movimientoFinalId))
                    .toList();
            System.out.println("  - 📊 Detalles en BD para este movimiento: " + detallesFinalesEnBD.size());
            if (detallesFinalesEnBD.size() != movimientoFinal.getDetalles().size()) {
                System.out.println("  - ⚠️ ADVERTENCIA: Discrepancia entre entidad y BD!");
                System.out.println("    - Entidad: " + movimientoFinal.getDetalles().size());
                System.out.println("    - BD: " + detallesFinalesEnBD.size());
            }

            // Recalcular precios de inversión de productos
            System.out.println("🔄 Recalculando precios de inversión...");
            for (Long insumoId : insumosParaRecalcular) {
                recalcularPrecioInversionProductos(insumoId);
            }

            System.out.println("🎉 Edición completada exitosamente");
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
     */
    private boolean verificarUsoEnProduccionPosterior(Insumo insumo, LocalDate fechaMovimiento) {
        // Obtener todos los productos que usan este insumo
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

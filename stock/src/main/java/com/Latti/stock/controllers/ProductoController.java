package com.Latti.stock.controllers;

import com.Latti.stock.dtos.ActualizarProductoConRecetaDTO;
import com.Latti.stock.dtos.CrearProductoConRecetaDTO;
import com.Latti.stock.dtos.ProductoResponseDTO;
import com.Latti.stock.dtos.StockPorLoteDTO;
import com.Latti.stock.dtos.ProductoProximoVencerDTO;
import com.Latti.stock.dtos.ProductoVencidoDTO;
import com.Latti.stock.dtos.PerdidaDTO;
import com.Latti.stock.modules.Producto;
import com.Latti.stock.modules.DetalleMovimientoProducto;
import com.Latti.stock.modules.MovimientoProductoLote;
import com.Latti.stock.modules.TipoMovimiento;
import com.Latti.stock.repositories.ProductoRepository;
import com.Latti.stock.repositories.MovimientoProductoLoteRepository;
import com.Latti.stock.service.ProductoService;
import com.Latti.stock.service.MovimientoProductoLoteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/productos")
public class ProductoController {

    private final ProductoService productoService;
    private final MovimientoProductoLoteService movimientoProductoLoteService;
    private final ProductoRepository productoRepository;
    private final MovimientoProductoLoteRepository movimientoProductoLoteRepository;

    @Autowired
    public ProductoController(ProductoService productoService, MovimientoProductoLoteService movimientoProductoLoteService, ProductoRepository productoRepository, MovimientoProductoLoteRepository movimientoProductoLoteRepository) {
        this.productoService = productoService;
        this.movimientoProductoLoteService = movimientoProductoLoteService;
        this.productoRepository = productoRepository;
        this.movimientoProductoLoteRepository = movimientoProductoLoteRepository;
    }

    @PostMapping
    public ResponseEntity<?> crearProductoConReceta(@RequestBody CrearProductoConRecetaDTO dto) {
        try {
            Producto productoCreado = productoService.crearProducto(dto);
            return ResponseEntity.ok(new ProductoResponseDTO("Producto creado con éxito", productoCreado));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Error inesperado al crear el producto"));
        }
    }

    @GetMapping
    public ResponseEntity<?> obtenerTodosLosProductos() {
        return ResponseEntity.ok(productoService.obtenerProductos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerProductoPorId(@PathVariable Long id) {
        try {
            Producto producto = productoService.obtenerProductoPorId(id);
            return ResponseEntity.ok(producto);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Error inesperado al buscar el producto"));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarProducto(
            @PathVariable Long id,
            @RequestBody ActualizarProductoConRecetaDTO dto) {
        try {
            Producto actualizado = productoService.actualizarProducto(id, dto);
            return ResponseEntity.ok(actualizado);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Error al actualizar producto"));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarProducto(@PathVariable Long id) {
        try {
            productoService.eliminarProducto(id);
            return ResponseEntity.ok(Map.of("mensaje", "Producto eliminado correctamente"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Error inesperado al eliminar el producto"));
        }
    }

    @GetMapping("/{id}/stock-por-lotes")
    public ResponseEntity<?> obtenerStockPorLotes(@PathVariable Long id) {
        try {
            List<StockPorLoteDTO> stockPorLotes = movimientoProductoLoteService.obtenerStockPorLotes(id);
            return ResponseEntity.ok(stockPorLotes);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Error inesperado al obtener stock por lotes"));
        }
    }

    /**
     * Obtiene productos próximos a vencer (dentro de los próximos N días)
     */
    @GetMapping("/proximos-vencer")
    public ResponseEntity<?> obtenerProductosProximosAVencer(
            @RequestParam(defaultValue = "7") int diasAnticipacion) {
        try {
            LocalDate fechaLimite = LocalDate.now().plusDays(diasAnticipacion);
            LocalDate hoy = LocalDate.now();
            
            List<Producto> productos = productoRepository.findAll();
            List<ProductoProximoVencerDTO> resultado = new ArrayList<>();
            
            for (Producto producto : productos) {
                List<StockPorLoteDTO> lotes = movimientoProductoLoteService.obtenerStockPorLotes(producto.getId());
                
                for (StockPorLoteDTO lote : lotes) {
                    if (lote.fechaVencimiento() != null && 
                        !lote.fechaVencimiento().isAfter(fechaLimite) &&
                        lote.cantidadDisponible() > 0) {
                        
                        long diasHastaVencimiento = ChronoUnit.DAYS.between(hoy, lote.fechaVencimiento());
                        
                        // Solo incluir si no está vencido (días >= 0) o si está vencido pero dentro del rango
                        if (diasHastaVencimiento >= 0 || (diasHastaVencimiento < 0 && Math.abs(diasHastaVencimiento) <= diasAnticipacion)) {
                            resultado.add(new ProductoProximoVencerDTO(
                                producto.getId(),
                                producto.getNombre(),
                                lote.lote(),
                                lote.cantidadDisponible(),
                                lote.fechaVencimiento(),
                                (int) diasHastaVencimiento,
                                producto.getPrecioInversion() * lote.cantidadDisponible()
                            ));
                        }
                    }
                }
            }
            
            // Ordenar por días hasta vencimiento (más urgentes primero)
            resultado.sort(Comparator.comparing(ProductoProximoVencerDTO::diasHastaVencimiento));
            
            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error inesperado al obtener productos próximos a vencer: " + e.getMessage()));
        }
    }

    /**
     * Obtiene productos vencidos (fecha de vencimiento anterior a hoy)
     */
    @GetMapping("/vencidos")
    public ResponseEntity<?> obtenerProductosVencidos() {
        try {
            LocalDate hoy = LocalDate.now();
            
            List<Producto> productos = productoRepository.findAll();
            List<ProductoVencidoDTO> resultado = new ArrayList<>();
            
            for (Producto producto : productos) {
                List<StockPorLoteDTO> lotes = movimientoProductoLoteService.obtenerStockPorLotes(producto.getId());
                
                for (StockPorLoteDTO lote : lotes) {
                    if (lote.fechaVencimiento() != null && 
                        lote.fechaVencimiento().isBefore(hoy) &&
                        lote.cantidadDisponible() > 0) {
                        
                        long diasVencidos = ChronoUnit.DAYS.between(lote.fechaVencimiento(), hoy);
                        
                        resultado.add(new ProductoVencidoDTO(
                            producto.getId(),
                            producto.getNombre(),
                            lote.lote(),
                            lote.cantidadDisponible(),
                            lote.fechaVencimiento(),
                            (int) diasVencidos,
                            producto.getPrecioInversion() * lote.cantidadDisponible()
                        ));
                    }
                }
            }
            
            // Ordenar por días vencidos (más vencidos primero)
            resultado.sort(Comparator.comparing(ProductoVencidoDTO::diasVencidos).reversed());
            
            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error inesperado al obtener productos vencidos: " + e.getMessage()));
        }
    }

    /**
     * Obtiene el historial de pérdidas (movimientos de SALIDA con descripción que contiene "DESCARTO")
     */
    @GetMapping("/perdidas")
    public ResponseEntity<?> obtenerPerdidas() {
        try {
            List<MovimientoProductoLote> movimientos = movimientoProductoLoteRepository.findAll();
            List<PerdidaDTO> perdidas = new ArrayList<>();
            
            for (MovimientoProductoLote movimiento : movimientos) {
                if (movimiento.getTipoMovimiento() == TipoMovimiento.SALIDA) {
                    for (DetalleMovimientoProducto detalle : movimiento.getDetalles()) {
                        // Verificar si la descripción contiene "DESCARTO" (indica que es un descarte)
                        if (movimiento.getDescripcion() != null && 
                            movimiento.getDescripcion().toUpperCase().contains("DESCARTO")) {
                            
                            Producto producto = detalle.getProducto();
                            
                            // Calcular días vencidos desde la fecha de vencimiento del lote hasta la fecha del descarte
                            int diasVencidos = 0;
                            if (detalle.getFechaVencimiento() != null && 
                                detalle.getFechaVencimiento().isBefore(movimiento.getFecha())) {
                                diasVencidos = (int) ChronoUnit.DAYS.between(detalle.getFechaVencimiento(), movimiento.getFecha());
                            }
                            
                            // Calcular valor perdido (precio de inversión * cantidad)
                            // El precio de inversión es el costo de producir el producto
                            double valorPerdido = producto.getPrecioInversion() * detalle.getCantidad();
                            
                            perdidas.add(new PerdidaDTO(
                                movimiento.getId(),
                                movimiento.getFecha(),
                                movimiento.getDescripcion(),
                                producto.getId(),
                                producto.getNombre(),
                                detalle.getLote() != null ? detalle.getLote() : "N/A",
                                detalle.getCantidad(),
                                valorPerdido,
                                diasVencidos
                            ));
                        }
                    }
                }
            }
            
            // Ordenar por fecha (más recientes primero)
            perdidas.sort(Comparator.comparing(PerdidaDTO::fecha).reversed());
            
            return ResponseEntity.ok(perdidas);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error inesperado al obtener pérdidas: " + e.getMessage()));
        }
    }

}

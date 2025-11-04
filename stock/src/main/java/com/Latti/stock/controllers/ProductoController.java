package com.Latti.stock.controllers;

import com.Latti.stock.dtos.ActualizarProductoConRecetaDTO;
import com.Latti.stock.dtos.CrearProductoConRecetaDTO;
import com.Latti.stock.dtos.ProductoResponseDTO;
import com.Latti.stock.dtos.StockPorLoteDTO;
import com.Latti.stock.modules.Producto;
import com.Latti.stock.service.ProductoService;
import com.Latti.stock.service.MovimientoProductoLoteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/productos")
public class ProductoController {

    private final ProductoService productoService;
    private final MovimientoProductoLoteService movimientoProductoLoteService;

    @Autowired
    public ProductoController(ProductoService productoService, MovimientoProductoLoteService movimientoProductoLoteService) {
        this.productoService = productoService;
        this.movimientoProductoLoteService = movimientoProductoLoteService;
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
     * 🔧 ENDPOINT TEMPORAL: Actualizar stockMinimo de todos los productos que tienen 0
     * Este endpoint puede eliminarse después de ejecutarlo una vez
     */
    @PostMapping("/fix-stock-minimo")
    public ResponseEntity<?> fixStockMinimo() {
        try {
            System.out.println("🔧 Actualizando stockMinimo de todos los productos...");
            java.util.List<Producto> productos = productoRepository.findAll();
            int actualizados = 0;
            
            for (Producto producto : productos) {
                if (producto.getStockMinimo() == 0) {
                    // Establecer un valor por defecto razonable (10% del stock actual o 5, lo que sea mayor)
                    double stockMinimoSugerido = Math.max(5, producto.getStockActual() * 0.1);
                    producto.setStockMinimo(stockMinimoSugerido);
                    productoRepository.save(producto);
                    actualizados++;
                    System.out.println("  ✅ Producto '" + producto.getNombre() + "': stockMinimo = " + stockMinimoSugerido);
                }
            }
            
            System.out.println("🎉 Actualización completada: " + actualizados + " productos actualizados");
            return ResponseEntity.ok(Map.of(
                "mensaje", "Stock mínimo actualizado correctamente",
                "productosActualizados", actualizados
            ));
        } catch (Exception e) {
            System.err.println("❌ Error al actualizar stock mínimo: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error al actualizar stock mínimo: " + e.getMessage()));
        }
    }

}

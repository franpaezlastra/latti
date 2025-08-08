package com.Latti.stock.controllers;

import com.Latti.stock.dtos.CrearMovimientoProductoDTO;
import com.Latti.stock.dtos.CrearVentaPorLotesDTO;
import com.Latti.stock.dtos.ResponseMovimientosProductoLoteDTO;
import com.Latti.stock.modules.MovimientoProductoLote;
import com.Latti.stock.service.MovimientoProductoLoteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/movimiento-productos")
public class MovimientoProductoController {

    @Autowired
    private MovimientoProductoLoteService movimientoProductoLoteService;

    @PostMapping
    public ResponseEntity<?> crearMovimiento(@RequestBody CrearMovimientoProductoDTO dto) {
        try {
            MovimientoProductoLote nuevo = movimientoProductoLoteService.crearMovimientoProducto(dto);
            return ResponseEntity.ok(Map.of(
                    "mensaje", "Movimiento de producto registrado correctamente",
                    "id", nuevo.getId()
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Error inesperado al registrar el movimiento de producto"));
        }
    }

    @GetMapping
    public ResponseEntity<List<ResponseMovimientosProductoLoteDTO>> obtenerMovimientos() {
        List<ResponseMovimientosProductoLoteDTO> movimientos = movimientoProductoLoteService.obtenerMovimientosDTO();
        return ResponseEntity.ok(movimientos);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarMovimiento(@PathVariable Long id) {
        try {
            MovimientoProductoLote eliminado = movimientoProductoLoteService.eliminarMovimientoProducto(id);
            return ResponseEntity.ok(Map.of(
                    "mensaje", "Movimiento de producto eliminado correctamente",
                    "id", eliminado.getId()
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Error inesperado al eliminar el movimiento de producto"));
        }
    }

    @PostMapping("/venta-por-lotes")
    public ResponseEntity<?> crearVentaPorLotes(@RequestBody CrearVentaPorLotesDTO dto) {
        try {
            MovimientoProductoLote nuevo = movimientoProductoLoteService.crearVentaPorLotes(dto);
            return ResponseEntity.ok(Map.of(
                    "mensaje", "Venta por lotes registrada correctamente",
                    "id", nuevo.getId()
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Error inesperado al registrar la venta por lotes"));
        }
    }
}

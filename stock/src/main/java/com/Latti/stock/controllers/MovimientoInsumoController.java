package com.Latti.stock.controllers;


import com.Latti.stock.dtos.CrearMovimientoDeInsumoDTO;
import com.Latti.stock.modules.MovimientoInsumoLote;
import com.Latti.stock.service.MovimientoInsumoLoteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import com.Latti.stock.dtos.ResponseMovimientosInsumoLoteDTO;

@RestController
@RequestMapping("/api/movimiento-insumo")
public class MovimientoInsumoController {

    @Autowired
    private MovimientoInsumoLoteService movimientoInsumoLoteService;


    @PostMapping
    public ResponseEntity<?> crearMovimiento(@RequestBody CrearMovimientoDeInsumoDTO dto) {
        try {
            MovimientoInsumoLote movimiento = movimientoInsumoLoteService.crearMovimientoInsumo(dto);
            return ResponseEntity.ok(Map.of(
                    "mensaje", "Movimiento de insumo registrado correctamente",
                    "id", movimiento.getId()
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Error inesperado al registrar el movimiento de insumo"));
        }
    }

    @GetMapping
    public ResponseEntity<List<ResponseMovimientosInsumoLoteDTO>> obtenerMovimientos() {
        List<ResponseMovimientosInsumoLoteDTO> movimientos = movimientoInsumoLoteService.obtenerMovimientosDTO();
        return ResponseEntity.ok(movimientos);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarMovimiento(@PathVariable Long id) {
        try {
            MovimientoInsumoLote eliminado = movimientoInsumoLoteService.eliminarMovimientoInsumo(id);
            return ResponseEntity.ok(Map.of(
                    "mensaje", "Movimiento de insumo eliminado correctamente",
                    "id", eliminado.getId()
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Error inesperado al eliminar el movimiento de insumo"));
        }
    }
}



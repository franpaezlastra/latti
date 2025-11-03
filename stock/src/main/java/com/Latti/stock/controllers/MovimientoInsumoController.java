package com.Latti.stock.controllers;


import com.Latti.stock.dtos.CrearMovimientoDeInsumoDTO;
import com.Latti.stock.dtos.EditarMovimientoDeInsumoDTO;
import com.Latti.stock.dtos.ValidacionEdicionDTO;
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

    @GetMapping("/{id}/validar-edicion")
    public ResponseEntity<ValidacionEdicionDTO> validarEdicion(@PathVariable Long id) {
        try {
            ValidacionEdicionDTO validacion = movimientoInsumoLoteService.validarEdicionMovimiento(id);
            return ResponseEntity.ok(validacion);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ValidacionEdicionDTO(false, "Error al validar edición: " + e.getMessage(), List.of()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> editarMovimiento(@PathVariable Long id, @RequestBody EditarMovimientoDeInsumoDTO dto) {
        try {
            // Logs detallados para depuración
            System.out.println("🔍 === BACKEND: INICIO DE EDICIÓN ===");
            System.out.println("📦 ID del movimiento (path): " + id);
            System.out.println("📝 DTO recibido: " + dto);
            
            // Verificar si el DTO es null
            if (dto == null) {
                System.err.println("❌ ERROR: DTO es null");
                return ResponseEntity.badRequest().body(Map.of("error", "DTO es null"));
            }
            
            System.out.println("📅 Fecha: " + dto.fecha());
            System.out.println("📄 Descripción: " + dto.descripcion());
            System.out.println("🔄 Tipo: " + dto.tipoMovimiento());
            System.out.println("📋 Cantidad de detalles: " + (dto.detalles() != null ? dto.detalles().size() : "null"));
            System.out.println("📋 Detalles recibidos:");
            if (dto.detalles() != null) {
                for (int i = 0; i < dto.detalles().size(); i++) {
                    var det = dto.detalles().get(i);
                    System.out.println("  [" + i + "] insumoId=" + det.insumoId() + 
                                     ", cantidad=" + det.cantidad() + 
                                     ", precio=" + det.precio());
                }
            } else {
                System.out.println("  - null");
            }
            
            // Asegurar que el ID del path coincida con el del DTO
            System.out.println("🔄 Creando DTO con ID corregido...");
            EditarMovimientoDeInsumoDTO dtoConId = new EditarMovimientoDeInsumoDTO(
                id, dto.fecha(), dto.descripcion(), dto.tipoMovimiento(), dto.detalles()
            );
            
            System.out.println("✅ DTO con ID corregido creado exitosamente");
            
            System.out.println("🔄 Llamando al servicio editarMovimientoInsumo...");
            MovimientoInsumoLote movimiento = movimientoInsumoLoteService.editarMovimientoInsumo(dtoConId);
            
            System.out.println("🎉 Movimiento editado exitosamente: " + movimiento.getId());
            
            return ResponseEntity.ok(Map.of(
                    "mensaje", "Movimiento de insumo editado correctamente",
                    "id", movimiento.getId()
            ));
        } catch (IllegalArgumentException e) {
            System.err.println("❌ Error de validación: " + e.getMessage());
            System.err.println("❌ Stack trace:");
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            System.err.println("💥 Error inesperado en el controlador: " + e.getMessage());
            System.err.println("💥 Tipo de excepción: " + e.getClass().getName());
            System.err.println("💥 Stack trace completo:");
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error inesperado al editar el movimiento de insumo: " + e.getMessage()));
        }
    }
}



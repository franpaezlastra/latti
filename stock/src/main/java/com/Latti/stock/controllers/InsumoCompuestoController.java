package com.Latti.stock.controllers;

import com.Latti.stock.dtos.CrearInsumoCompuestoDTO;
import com.Latti.stock.dtos.EnsamblarInsumoCompuestoDTO;
import com.Latti.stock.dtos.InsumoCompuestoResponseDTO;
import com.Latti.stock.service.InsumoCompuestoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/insumos-compuestos")
@CrossOrigin(origins = "*")
public class InsumoCompuestoController {

    @Autowired
    private InsumoCompuestoService insumoCompuestoService;

    /**
     * Crear un nuevo insumo compuesto
     */
    @PostMapping
    public ResponseEntity<?> crearInsumoCompuesto(@RequestBody CrearInsumoCompuestoDTO dto) {
        try {
            System.out.println("🔍 Creando insumo compuesto: " + dto.nombre());
            System.out.println("🔍 Receta: " + dto.receta());
            
            InsumoCompuestoResponseDTO insumoCompuesto = insumoCompuestoService.crearInsumoCompuesto(dto);
            System.out.println("✅ Insumo compuesto creado exitosamente");
            
            return ResponseEntity.ok(Map.of(
                "mensaje", "Insumo compuesto creado correctamente",
                "insumo", insumoCompuesto
            ));
        } catch (IllegalArgumentException e) {
            System.err.println("❌ Error de validación: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            System.err.println("❌ Error inesperado: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error inesperado al crear el insumo compuesto: " + e.getMessage()));
        }
    }

    /**
     * Obtener todos los insumos compuestos
     */
    @GetMapping
    public ResponseEntity<List<InsumoCompuestoResponseDTO>> obtenerInsumosCompuestos() {
        List<InsumoCompuestoResponseDTO> insumosCompuestos = insumoCompuestoService.obtenerInsumosCompuestos();
        return ResponseEntity.ok(insumosCompuestos);
    }

    /**
     * Obtener un insumo compuesto por ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<InsumoCompuestoResponseDTO> obtenerInsumoCompuestoPorId(@PathVariable Long id) {
        try {
            InsumoCompuestoResponseDTO insumoCompuesto = insumoCompuestoService.obtenerInsumoCompuestoPorId(id);
            return ResponseEntity.ok(insumoCompuesto);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Ensamblar insumos compuestos
     */
    @PostMapping("/{id}/ensamblar")
    public ResponseEntity<InsumoCompuestoResponseDTO> ensamblarInsumoCompuesto(
            @PathVariable Long id,
            @RequestBody EnsamblarInsumoCompuestoDTO dto) {
        try {
            InsumoCompuestoResponseDTO insumoCompuesto = insumoCompuestoService.ensamblarInsumoCompuesto(id, dto);
            return ResponseEntity.ok(insumoCompuesto);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Actualizar un insumo compuesto existente
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarInsumoCompuesto(@PathVariable Long id, @RequestBody CrearInsumoCompuestoDTO dto) {
        try {
            System.out.println("🔍 Actualizando insumo compuesto ID: " + id);
            System.out.println("🔍 Receta: " + dto.receta());
            
            InsumoCompuestoResponseDTO insumoActualizado = insumoCompuestoService.actualizarInsumoCompuesto(id, dto);
            System.out.println("✅ Insumo compuesto actualizado exitosamente");
            
            return ResponseEntity.ok(Map.of(
                "mensaje", "Insumo compuesto actualizado correctamente",
                "insumo", insumoActualizado
            ));
        } catch (IllegalArgumentException e) {
            System.err.println("❌ Error de validación: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            System.err.println("❌ Error inesperado: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error inesperado al actualizar el insumo compuesto: " + e.getMessage()));
        }
    }

    /**
     * Eliminar un insumo compuesto
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarInsumoCompuesto(@PathVariable Long id) {
        try {
            insumoCompuestoService.eliminarInsumoCompuesto(id);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Validar stock suficiente para ensamblar (endpoint auxiliar)
     */
    @PostMapping("/{id}/validar-stock")
    public ResponseEntity<Void> validarStockSuficiente(@PathVariable Long id, @RequestParam double cantidad) {
        try {
            insumoCompuestoService.validarStockSuficienteParaEnsamblar(id, cantidad);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}

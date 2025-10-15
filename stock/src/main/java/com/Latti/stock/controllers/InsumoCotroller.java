package com.Latti.stock.controllers;


import com.Latti.stock.dtos.CrearInsumoDTO;
import com.Latti.stock.dtos.InsumoResponseDTO;
import com.Latti.stock.modules.Insumo;
import com.Latti.stock.service.InsumoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/insumos")
public class InsumoCotroller {

    @Autowired
    private InsumoService insumoService;

    @PostMapping
    public ResponseEntity<?> crearInsumoBase(@RequestBody CrearInsumoDTO dto) {
        try {
            System.out.println("🔍 Creando insumo base: " + dto.nombre());
            Insumo insumoCreado = insumoService.crearInsumo(dto);
            System.out.println("✅ Insumo base creado exitosamente");
            return ResponseEntity.ok(new InsumoResponseDTO("Insumo base creado correctamente", insumoCreado));
        } catch (IllegalArgumentException e) {
            System.err.println("❌ Error de validación: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            System.err.println("❌ Error inesperado: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error inesperado al crear el insumo base: " + e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<?> obtenerInsumosBase() {
        try {
            java.util.List<com.Latti.stock.dtos.InsumoListadoDTO> insumosBase = insumoService.obtenerInsumos();
            return ResponseEntity.ok(insumosBase);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Error al obtener la lista de insumos base"));
        }
    }

    @GetMapping("/todos")
    public ResponseEntity<?> obtenerTodosLosInsumos() {
        try {
            // Obtener insumos base
            java.util.List<com.Latti.stock.dtos.InsumoListadoDTO> insumosBase = insumoService.obtenerInsumos();
            
            // Crear lista unificada con estructura que el frontend espera
            java.util.List<Map<String, Object>> todosLosInsumos = new java.util.ArrayList<>();
            
            // Agregar insumos base
            insumosBase.forEach(base -> {
                Map<String, Object> insumoMap = new java.util.HashMap<>();
                insumoMap.put("id", base.id());
                insumoMap.put("nombre", base.nombre());
                insumoMap.put("unidadMedida", base.unidadMedida().toString());
                insumoMap.put("tipo", base.tipo().toString());
                insumoMap.put("stockActual", base.stockActual());
                insumoMap.put("precioDeCompra", base.precioDeCompra());
                insumoMap.put("totalInvertido", base.totalInvertido());
                insumoMap.put("receta", null); // Los insumos base no tienen receta
                todosLosInsumos.add(insumoMap);
            });
            
            return ResponseEntity.ok(todosLosInsumos);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Error al obtener la lista de insumos"));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarInsumo(@PathVariable Long id) {
        try {
            insumoService.eliminarInsumo(id);
            return ResponseEntity.ok(Map.of("mensaje", "Insumo eliminado correctamente"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Error inesperado al eliminar el insumo"));
        }
    }
}




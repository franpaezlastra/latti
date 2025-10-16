package com.Latti.stock.controllers;


import com.Latti.stock.dtos.CrearInsumoDTO;
import com.Latti.stock.dtos.InsumoResponseDTO;
import com.Latti.stock.dtos.InsumoCompuestoResponseDTO;
import com.Latti.stock.modules.Insumo;
import com.Latti.stock.service.InsumoService;
import com.Latti.stock.service.InsumoCompuestoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/insumos")
public class InsumoCotroller {

    @Autowired
    private InsumoService insumoService;

    @Autowired
    private InsumoCompuestoService insumoCompuestoService;

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
            
            // Obtener insumos compuestos
            java.util.List<InsumoCompuestoResponseDTO> insumosCompuestos = 
                insumoCompuestoService.obtenerInsumosCompuestos();
            
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
            
            // Agregar insumos compuestos
            insumosCompuestos.forEach(compuesto -> {
                Map<String, Object> insumoMap = new java.util.HashMap<>();
                insumoMap.put("id", compuesto.id());
                insumoMap.put("nombre", compuesto.nombre());
                insumoMap.put("unidadMedida", compuesto.unidadMedida().toString());
                insumoMap.put("tipo", compuesto.tipo().toString());
                insumoMap.put("stockActual", compuesto.stockActual());
                insumoMap.put("precioDeCompra", compuesto.precioDeCompra());
                insumoMap.put("totalInvertido", 0.0); // Los compuestos no tienen total invertido directo
                // Convertir receta a formato que el frontend espera
                java.util.List<Map<String, Object>> recetaFormateada = compuesto.receta().stream()
                    .map(componente -> {
                        Map<String, Object> componenteMap = new java.util.HashMap<>();
                        componenteMap.put("id", componente.id());
                        componenteMap.put("insumoBaseId", componente.insumoBaseId());
                        componenteMap.put("nombreInsumoBase", componente.nombreInsumoBase());
                        componenteMap.put("cantidad", componente.cantidad());
                        componenteMap.put("unidadMedida", componente.unidadMedida().toString());
                        return componenteMap;
                    })
                    .collect(java.util.stream.Collectors.toList());
                insumoMap.put("receta", recetaFormateada);
                todosLosInsumos.add(insumoMap);
            });
            
            return ResponseEntity.ok(todosLosInsumos);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Error al obtener la lista de insumos"));
        }
    }

    /**
     * Actualizar un insumo base existente
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarInsumoBase(@PathVariable Long id, @RequestBody CrearInsumoDTO dto) {
        try {
            System.out.println("🔍 Actualizando insumo base ID: " + id);
            Insumo insumoActualizado = insumoService.actualizarInsumo(id, dto);
            System.out.println("✅ Insumo base actualizado exitosamente");
            return ResponseEntity.ok(new InsumoResponseDTO("Insumo base actualizado correctamente", insumoActualizado));
        } catch (IllegalArgumentException e) {
            System.err.println("❌ Error de validación: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            System.err.println("❌ Error inesperado: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error inesperado al actualizar el insumo base: " + e.getMessage()));
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




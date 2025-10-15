package com.Latti.stock.controllers;


import com.Latti.stock.dtos.CrearInsumoDTO;
import com.Latti.stock.dtos.CrearInsumoCompuestoDTO;
import com.Latti.stock.dtos.InsumoResponseDTO;
import com.Latti.stock.dtos.InsumoCompuestoResponseDTO;
import com.Latti.stock.dtos.InsumoUnificadoDTO;
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
    public ResponseEntity<?> crearInsumo(@RequestBody Map<String, Object> requestBody) {
        try {
            // Verificar si es un insumo compuesto
            String tipo = (String) requestBody.get("tipo");
            
            if ("COMPUESTO".equals(tipo)) {
                // Convertir a DTO de insumo compuesto
                CrearInsumoCompuestoDTO dto = new CrearInsumoCompuestoDTO(
                    (String) requestBody.get("nombre"),
                    (String) requestBody.get("unidadMedida"),
                    (java.util.List<com.Latti.stock.dtos.RecetaInsumoDTO>) requestBody.get("receta")
                );
                
                InsumoCompuestoResponseDTO insumoCompuesto = insumoCompuestoService.crearInsumoCompuesto(dto);
                return ResponseEntity.ok(Map.of(
                    "mensaje", "Insumo compuesto creado correctamente",
                    "insumo", insumoCompuesto
                ));
            } else {
                // Insumo base normal
                CrearInsumoDTO dto = new CrearInsumoDTO(
                    (String) requestBody.get("nombre"),
                    (String) requestBody.get("unidadMedida")
                );
                
                Insumo insumoCreado = insumoService.crearInsumo(dto);
                return ResponseEntity.ok(new InsumoResponseDTO("Insumo creado correctamente", insumoCreado));
            }
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Error inesperado al crear el insumo"));
        }
    }

    @GetMapping
    public ResponseEntity<?> obtenerInsumos() {
        try {
            // Obtener insumos base
            java.util.List<com.Latti.stock.dtos.InsumoListadoDTO> insumosBase = insumoService.obtenerInsumos();
            
            // Obtener insumos compuestos
            java.util.List<InsumoCompuestoResponseDTO> insumosCompuestos = insumoCompuestoService.obtenerInsumosCompuestos();
            
            // Crear lista unificada con estructura simple que el frontend espera
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
                insumoMap.put("totalInvertido", 0.0); // Los compuestos no tienen total invertido
                insumoMap.put("receta", compuesto.receta()); // Los compuestos sí tienen receta
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




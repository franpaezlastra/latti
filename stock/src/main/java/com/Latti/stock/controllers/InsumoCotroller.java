package com.Latti.stock.controllers;


import com.Latti.stock.dtos.CrearInsumoDTO;
import com.Latti.stock.dtos.CrearInsumoCompuestoDTO;
import com.Latti.stock.dtos.InsumoResponseDTO;
import com.Latti.stock.dtos.InsumoCompuestoResponseDTO;
import com.Latti.stock.dtos.InsumoUnificadoDTO;
import com.Latti.stock.modules.UnidadMedida;
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
            System.out.println("🔍 Request body recibido: " + requestBody);
            
            // Verificar si es un insumo compuesto
            String tipo = (String) requestBody.get("tipo");
            System.out.println("🔍 Tipo detectado: " + tipo);
            
            if ("COMPUESTO".equals(tipo)) {
                System.out.println("🔍 Procesando insumo compuesto...");
                
                // Convertir a DTO de insumo compuesto
                String nombre = (String) requestBody.get("nombre");
                String unidadMedidaStr = (String) requestBody.get("unidadMedida");
                
                System.out.println("🔍 Nombre: " + nombre);
                System.out.println("🔍 Unidad medida string: " + unidadMedidaStr);
                
                UnidadMedida unidadMedida = UnidadMedida.valueOf(unidadMedidaStr);
                
                // Convertir la receta del formato frontend al DTO
                java.util.List<Map<String, Object>> recetaRaw = (java.util.List<Map<String, Object>>) requestBody.get("receta");
                System.out.println("🔍 Receta raw: " + recetaRaw);
                
                java.util.List<CrearInsumoCompuestoDTO.ComponenteRecetaDTO> receta = recetaRaw.stream()
                    .map(item -> {
                        System.out.println("🔍 Procesando componente: " + item);
                        Long insumoBaseId = ((Number) item.get("insumoBaseId")).longValue();
                        Double cantidad = ((Number) item.get("cantidad")).doubleValue();
                        System.out.println("🔍 Insumo base ID: " + insumoBaseId + ", Cantidad: " + cantidad);
                        return new CrearInsumoCompuestoDTO.ComponenteRecetaDTO(insumoBaseId, cantidad);
                    })
                    .toList();
                
                System.out.println("🔍 Receta procesada: " + receta);
                
                CrearInsumoCompuestoDTO dto = new CrearInsumoCompuestoDTO(nombre, unidadMedida, receta);
                System.out.println("🔍 DTO creado: " + dto);
                
                InsumoCompuestoResponseDTO insumoCompuesto = insumoCompuestoService.crearInsumoCompuesto(dto);
                System.out.println("✅ Insumo compuesto creado exitosamente");
                
                return ResponseEntity.ok(Map.of(
                    "mensaje", "Insumo compuesto creado correctamente",
                    "insumo", insumoCompuesto
                ));
            } else {
                System.out.println("🔍 Procesando insumo base...");
                
                // Insumo base normal
                String nombre = (String) requestBody.get("nombre");
                String unidadMedidaStr = (String) requestBody.get("unidadMedida");
                UnidadMedida unidadMedida = UnidadMedida.valueOf(unidadMedidaStr);
                
                CrearInsumoDTO dto = new CrearInsumoDTO(nombre, unidadMedida);
                
                Insumo insumoCreado = insumoService.crearInsumo(dto);
                return ResponseEntity.ok(new InsumoResponseDTO("Insumo creado correctamente", insumoCreado));
            }
        } catch (IllegalArgumentException e) {
            System.err.println("❌ Error de validación: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            System.err.println("❌ Error inesperado: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error inesperado al crear el insumo: " + e.getMessage()));
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




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
    public ResponseEntity<?> crearInsumo(@RequestBody CrearInsumoDTO dto) {
        try {
            Insumo insumoCreado = insumoService.crearInsumo(dto);
            return ResponseEntity.ok(new InsumoResponseDTO("Insumo creado correctamente", insumoCreado));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Error inesperado al crear el insumo"));
        }
    }

    @GetMapping
    public ResponseEntity<?> obtenerInsumos() {
        try {
            return ResponseEntity.ok(insumoService.obtenerInsumos());
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




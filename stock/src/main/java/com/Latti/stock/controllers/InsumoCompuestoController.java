package com.Latti.stock.controllers;

import com.Latti.stock.dtos.CrearInsumoCompuestoDTO;
import com.Latti.stock.dtos.EnsamblarInsumoCompuestoDTO;
import com.Latti.stock.dtos.InsumoCompuestoResponseDTO;
import com.Latti.stock.service.InsumoCompuestoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/insumo-compuesto")
@CrossOrigin(origins = "*")
public class InsumoCompuestoController {

    @Autowired
    private InsumoCompuestoService insumoCompuestoService;

    /**
     * Crear un nuevo insumo compuesto
     */
    @PostMapping
    public ResponseEntity<InsumoCompuestoResponseDTO> crearInsumoCompuesto(@RequestBody CrearInsumoCompuestoDTO dto) {
        try {
            InsumoCompuestoResponseDTO insumoCompuesto = insumoCompuestoService.crearInsumoCompuesto(dto);
            return ResponseEntity.ok(insumoCompuesto);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
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

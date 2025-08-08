package com.Latti.stock.controllers;

import com.Latti.stock.dtos.CrearMovimientoProductoDTO;
import com.Latti.stock.dtos.DetalleMovimientoProductoDTO;
import com.Latti.stock.modules.TipoMovimiento;
import com.Latti.stock.service.MovimientoProductoLoteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
@CrossOrigin(origins = "*")
public class TestController {

    @Autowired
    private MovimientoProductoLoteService movimientoService;

    @PostMapping("/crear-movimiento-con-lote")
    public ResponseEntity<?> crearMovimientoConLote() {
        try {
            // Crear un movimiento de entrada con lotes
            CrearMovimientoProductoDTO dto = new CrearMovimientoProductoDTO(
                LocalDate.now(),
                "Prueba de lotes automáticos",
                TipoMovimiento.ENTRADA,
                List.of(
                    new DetalleMovimientoProductoDTO(
                        1L, // ID del producto
                        10.0, // cantidad
                        0.0, // precio venta (no aplica para entrada)
                        LocalDate.now().plusDays(30), // fecha vencimiento
                        null // lote (se generará automáticamente)
                    )
                )
            );

            var resultado = movimientoService.crearMovimientoProducto(dto);
            
            return ResponseEntity.ok(Map.of(
                "mensaje", "Movimiento creado exitosamente con lotes",
                "movimientoId", resultado.getId(),
                "lotes", resultado.getDetalles().stream()
                    .map(detalle -> Map.of(
                        "producto", detalle.getProducto().getNombre(),
                        "lote", detalle.getLote(),
                        "cantidad", detalle.getCantidad()
                    ))
                    .toList()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", e.getMessage()
            ));
        }
    }

    @GetMapping("/verificar-lotes")
    public ResponseEntity<?> verificarLotes() {
        try {
            var movimientos = movimientoService.obtenerMovimientosDTO();
            
            return ResponseEntity.ok(Map.of(
                "movimientos", movimientos.stream()
                    .map(mov -> Map.of(
                        "id", mov.id(),
                        "tipo", mov.tipoMovimiento(),
                        "detalles", mov.detalles().stream()
                            .map(det -> Map.of(
                                "producto", det.nombre(),
                                "lote", det.lote(),
                                "cantidad", det.cantidad()
                            ))
                            .toList()
                    ))
                    .toList()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", e.getMessage()
            ));
        }
    }
} 
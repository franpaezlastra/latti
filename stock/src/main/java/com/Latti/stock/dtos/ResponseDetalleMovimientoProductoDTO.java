package com.Latti.stock.dtos;

import java.time.LocalDate;

public record ResponseDetalleMovimientoProductoDTO(
    Long id,
    String nombre,
    double cantidad,
    double precioInversion,
    double precioVenta,
    LocalDate fechaVencimiento,
    String lote
) {}

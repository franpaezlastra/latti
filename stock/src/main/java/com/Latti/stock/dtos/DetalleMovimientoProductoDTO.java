package com.Latti.stock.dtos;

import java.time.LocalDate;

public record DetalleMovimientoProductoDTO(
    Long id,
    double cantidad,
    double precioVenta,
    LocalDate fechaVencimiento,
    String lote
) {}

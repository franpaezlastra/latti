package com.Latti.stock.dtos;

import java.time.LocalDate;

public record PerdidaDTO(
    Long movimientoId,
    LocalDate fecha,
    String descripcion,
    Long productoId,
    String nombreProducto,
    String lote,
    double cantidad,
    double valorPerdido,
    int diasVencidos
) {}


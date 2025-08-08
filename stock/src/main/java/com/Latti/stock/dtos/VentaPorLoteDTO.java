package com.Latti.stock.dtos;

public record VentaPorLoteDTO(
    Long productoId,
    String lote,
    double cantidad,
    double precioVenta
) {} 
package com.Latti.stock.dtos;

public record InsumoListadoDTO(
    Long id,
    String nombre,
    String unidadMedida,
    double stockActual,
    double precioDeCompra,
    double totalInvertido
) {} 
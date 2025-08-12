package com.Latti.stock.dtos;

import com.Latti.stock.modules.UnidadMedida;

public record InsumoListadoDTO(
    Long id,
    String nombre,
    UnidadMedida unidadMedida,
    double stockActual,
    double precioDeCompra,
    double totalInvertido
) {} 
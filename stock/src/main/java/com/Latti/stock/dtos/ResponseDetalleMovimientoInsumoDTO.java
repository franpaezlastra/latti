package com.Latti.stock.dtos;

import com.Latti.stock.modules.UnidadMedida;

public record ResponseDetalleMovimientoInsumoDTO(
    Long id, 
    String nombre, 
    double cantidad, 
    UnidadMedida unidadMedida, 
    double precioDeCompra, 
    double precioTotal
) {}

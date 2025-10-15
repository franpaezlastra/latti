package com.Latti.stock.dtos;

import com.Latti.stock.modules.UnidadMedida;
import com.Latti.stock.modules.TipoInsumo;

public record InsumoListadoDTO(
    Long id,
    String nombre,
    UnidadMedida unidadMedida,
    TipoInsumo tipo,
    double stockActual,
    double precioDeCompra,
    double totalInvertido
) {} 
package com.Latti.stock.dtos;

import com.Latti.stock.modules.UnidadMedida;
import com.Latti.stock.modules.TipoInsumo;

/**
 * DTO para obtener un insumo por ID sin referencias circulares
 */
public record InsumoDetalleDTO(
    Long id,
    String nombre,
    UnidadMedida unidadMedida,
    TipoInsumo tipo,
    double stockActual,
    double stockMinimo,
    double precioDeCompra
) {}


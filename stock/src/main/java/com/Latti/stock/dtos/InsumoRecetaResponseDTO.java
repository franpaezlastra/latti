package com.Latti.stock.dtos;

import com.Latti.stock.modules.UnidadMedida;

public record InsumoRecetaResponseDTO(
    Long insumoId,
    String nombre,
    UnidadMedida unidadMedida,
    double cantidadNecesaria
) {}


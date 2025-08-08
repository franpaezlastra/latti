package com.Latti.stock.dtos;

public record InsumoRecetaResponseDTO(
        Long insumoId,
        String nombre,
        String unidadMedida,
        double cantidadNecesaria
) {}


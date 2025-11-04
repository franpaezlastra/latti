package com.Latti.stock.dtos;

import java.util.List;

public record CrearProductoConRecetaDTO(
        String nombre,
        double stockMinimo,
        List<InsumoCantidadDTO> insumos
) {}


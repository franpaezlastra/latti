package com.Latti.stock.dtos;

import java.util.List;

public record CrearProductoConRecetaDTO(
        String nombre,
        List<InsumoCantidadDTO> insumos
) {}


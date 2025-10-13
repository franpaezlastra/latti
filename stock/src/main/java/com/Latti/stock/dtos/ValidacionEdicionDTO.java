package com.Latti.stock.dtos;

import java.util.List;

public record ValidacionEdicionDTO(
        boolean puedeEditar,
        String razon,
        List<String> detallesValidacion
) {}


package com.Latti.stock.dtos;

import java.util.List;

public record ActualizarProductoConRecetaDTO(
        String nombre,
        Double stockActual,
        Double precioInversion,
        Double precioVenta,
        List<InsumoCantidadDTO> insumos
) {}

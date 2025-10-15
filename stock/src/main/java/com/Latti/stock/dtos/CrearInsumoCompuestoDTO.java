package com.Latti.stock.dtos;

import com.Latti.stock.modules.UnidadMedida;
import java.util.List;

/**
 * DTO para crear un insumo compuesto
 */
public record CrearInsumoCompuestoDTO(
    String nombre,
    UnidadMedida unidadMedida,
    List<ComponenteRecetaDTO> receta
) {
    public record ComponenteRecetaDTO(
        Long insumoBaseId,
        double cantidad
    ) {}
}

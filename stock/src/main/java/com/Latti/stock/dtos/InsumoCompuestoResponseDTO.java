package com.Latti.stock.dtos;

import com.Latti.stock.modules.TipoInsumo;
import com.Latti.stock.modules.UnidadMedida;
import java.util.List;

/**
 * DTO de respuesta para insumos compuestos con su receta
 */
public record InsumoCompuestoResponseDTO(
    Long id,
    String nombre,
    UnidadMedida unidadMedida,
    TipoInsumo tipo,
    double stockActual,
    double precioDeCompra,
    List<ComponenteRecetaResponseDTO> receta
) {
    public record ComponenteRecetaResponseDTO(
        Long id,
        Long insumoBaseId,
        String nombreInsumoBase,
        double cantidad,
        UnidadMedida unidadMedida
    ) {}
}

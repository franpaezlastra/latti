package com.Latti.stock.dtos;

import com.Latti.stock.modules.UnidadMedida;
import com.Latti.stock.modules.TipoInsumo;

import java.util.List;

public record InsumoUnificadoDTO(
    Long id,
    String nombre,
    UnidadMedida unidadMedida,
    TipoInsumo tipo,
    double stockActual,
    double precioDeCompra,
    double totalInvertido,
    List<InsumoCompuestoResponseDTO.ComponenteRecetaResponseDTO> receta // Solo para insumos compuestos, null para base
) {
    // Constructor para insumos base
    public static InsumoUnificadoDTO fromBase(InsumoListadoDTO base) {
        return new InsumoUnificadoDTO(
            base.id(),
            base.nombre(),
            base.unidadMedida(),
            base.tipo(),
            base.stockActual(),
            base.precioDeCompra(),
            base.totalInvertido(),
            null
        );
    }
    
    // Constructor para insumos compuestos
    public static InsumoUnificadoDTO fromCompuesto(InsumoCompuestoResponseDTO compuesto) {
        return new InsumoUnificadoDTO(
            compuesto.id(),
            compuesto.nombre(),
            compuesto.unidadMedida(),
            compuesto.tipo(),
            compuesto.stockActual(),
            compuesto.precioDeCompra(),
            0.0, // Los compuestos no tienen total invertido
            compuesto.receta()
        );
    }
}

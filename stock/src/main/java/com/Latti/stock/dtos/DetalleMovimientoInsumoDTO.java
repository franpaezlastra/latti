package com.Latti.stock.dtos;

import com.Latti.stock.modules.TipoMovimiento;

public record DetalleMovimientoInsumoDTO(
        Long insumoId,
        double cantidad,
        double precio

) {}

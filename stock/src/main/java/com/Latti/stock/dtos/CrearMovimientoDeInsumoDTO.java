package com.Latti.stock.dtos;

import com.Latti.stock.modules.TipoMovimiento;

import java.time.LocalDate;
import java.util.List;

public record CrearMovimientoDeInsumoDTO(
        LocalDate fecha,
        String descripcion,
        TipoMovimiento tipoMovimiento,
        List<DetalleMovimientoInsumoDTO> detalles
) {}

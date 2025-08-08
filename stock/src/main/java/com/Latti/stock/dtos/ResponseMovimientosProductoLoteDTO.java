package com.Latti.stock.dtos;

import com.Latti.stock.modules.TipoMovimiento;

import java.time.LocalDate;
import java.util.List;

public record ResponseMovimientosProductoLoteDTO(Long id, LocalDate fecha, String descipcion, TipoMovimiento tipoMovimiento, List<ResponseDetalleMovimientoProductoDTO> detalles) {
}

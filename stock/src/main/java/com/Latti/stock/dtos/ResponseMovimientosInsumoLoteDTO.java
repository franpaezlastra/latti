package com.Latti.stock.dtos;

import com.Latti.stock.modules.TipoMovimiento;

import java.time.LocalDate;
import java.util.List;

public record ResponseMovimientosInsumoLoteDTO(Long id, LocalDate fecha, String descripcion, TipoMovimiento tipoMovimiento, List<ResponseDetalleMovimientoInsumoDTO> insumos) {
}

package com.Latti.stock.dtos;

import com.Latti.stock.modules.DetalleMovimientoProducto;
import com.Latti.stock.modules.TipoMovimiento;

import java.time.LocalDate;
import java.util.List;

public record CrearMovimientoProductoDTO(LocalDate fecha, String descripcion, TipoMovimiento tipoMovimiento, List<DetalleMovimientoProductoDTO> detalles) {
}

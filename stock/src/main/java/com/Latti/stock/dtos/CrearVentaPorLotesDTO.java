package com.Latti.stock.dtos;

import java.time.LocalDate;
import java.util.List;

public record CrearVentaPorLotesDTO(
    LocalDate fecha,
    String descripcion,
    List<VentaPorLoteDTO> ventasPorLotes
) {} 
package com.Latti.stock.dtos;

import java.time.LocalDate;

public record StockPorLoteDTO(
    String lote,
    double cantidadDisponible,
    LocalDate fechaVencimiento
) {} 
package com.Latti.stock.dtos;

import java.time.LocalDate;

public record ProductoProximoVencerDTO(
    Long productoId,
    String nombreProducto,
    String lote,
    double cantidadDisponible,
    LocalDate fechaVencimiento,
    int diasHastaVencimiento,
    double valorInversion
) {}


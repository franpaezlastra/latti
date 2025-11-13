package com.Latti.stock.dtos;

import java.time.LocalDate;

public record ProductoVencidoDTO(
    Long productoId,
    String nombreProducto,
    String lote,
    double cantidadDisponible,
    LocalDate fechaVencimiento,
    int diasVencidos,
    double valorPerdido
) {}


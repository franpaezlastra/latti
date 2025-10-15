package com.Latti.stock.dtos;

import java.time.LocalDate;

/**
 * DTO para ensamblar insumos compuestos
 */
public record EnsamblarInsumoCompuestoDTO(
    double cantidad,
    LocalDate fecha,
    String descripcion
) {}

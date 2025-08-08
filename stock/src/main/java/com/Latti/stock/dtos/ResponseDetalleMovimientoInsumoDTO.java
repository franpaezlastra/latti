package com.Latti.stock.dtos;

public record ResponseDetalleMovimientoInsumoDTO(Long id, String nombre, double cantidad, String unidadMedida, double precioDeCompra, double precioTotal) {
}

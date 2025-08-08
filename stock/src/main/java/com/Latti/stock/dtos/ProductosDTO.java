package com.Latti.stock.dtos;

import java.util.List;

public record ProductosDTO(Long id, String nombre, double stockActual, double precioInversion, double precioVenta, List<InsumoRecetaResponseDTO> receta) {
}

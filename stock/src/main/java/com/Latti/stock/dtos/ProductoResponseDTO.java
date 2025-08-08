package com.Latti.stock.dtos;

import com.Latti.stock.modules.Producto;

public class ProductoResponseDTO {
    private String mensaje;
    private Producto producto;

    public ProductoResponseDTO(String mensaje, Producto producto) {
        this.mensaje = mensaje;
        this.producto = producto;
    }

    public String getMensaje() { return mensaje; }
    public Producto getProducto() { return producto; }
} 
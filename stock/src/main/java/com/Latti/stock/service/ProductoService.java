package com.Latti.stock.service;

import com.Latti.stock.dtos.ActualizarProductoConRecetaDTO;
import com.Latti.stock.dtos.CrearProductoConRecetaDTO;
import com.Latti.stock.dtos.ProductosDTO;
import com.Latti.stock.modules.Producto;

import java.util.List;

public interface ProductoService {
    Producto crearProducto(CrearProductoConRecetaDTO crearProductoConRecetaDTO);

    List<ProductosDTO> obtenerProductos();

    Producto obtenerProductoPorId(Long id);

    void validar(CrearProductoConRecetaDTO dto);

    Producto actualizarProducto(Long id, ActualizarProductoConRecetaDTO dto);

    void eliminarProducto(Long id);

}

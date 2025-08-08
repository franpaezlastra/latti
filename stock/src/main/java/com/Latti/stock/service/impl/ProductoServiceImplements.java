package com.Latti.stock.service.impl;

import com.Latti.stock.dtos.*;
import com.Latti.stock.modules.Insumo;
import com.Latti.stock.modules.InsumoReceta;
import com.Latti.stock.modules.Producto;
import com.Latti.stock.modules.Receta;
import com.Latti.stock.repositories.InsumoRepository;
import com.Latti.stock.repositories.ProductoRepository;
import com.Latti.stock.repositories.RecetaRepository;
import com.Latti.stock.service.ProductoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductoServiceImplements implements ProductoService {

    @Autowired
    private InsumoRepository insumoRepository;

    @Autowired
    private RecetaRepository recetaRepository;

    @Autowired
    private ProductoRepository productoRepository;


    @Override
    @Transactional
    public Producto crearProducto(CrearProductoConRecetaDTO crearProductoConRecetaDTO) {
        validar(crearProductoConRecetaDTO);

        String nombre = crearProductoConRecetaDTO.nombre().trim();
        // Validación de nombre único (ignorando mayúsculas/minúsculas)
        if (productoRepository.existsByNombreIgnoreCase(nombre)) {
            throw new IllegalArgumentException("Ya existe un producto con ese nombre.");
        }

        Receta receta = new Receta();
        double precioInversionTotal = 0;

        for (InsumoCantidadDTO insumoDTO : crearProductoConRecetaDTO.insumos()) {
            Insumo insumo = insumoRepository.findById(insumoDTO.insumoId())
                    .orElseThrow(() -> new IllegalArgumentException("Insumo no encontrado: ID " + insumoDTO.insumoId()));

            if (insumoDTO.cantidad() <= 0) {
                throw new IllegalArgumentException("La cantidad de cada insumo debe ser mayor a 0.");
            }

            InsumoReceta detalle = new InsumoReceta(insumoDTO.cantidad());

            receta.addDetalle(detalle);
            insumo.addDetalleReceta(detalle);

            // Cálculo del precio de inversión:
            precioInversionTotal += insumoDTO.cantidad() * insumo.getPrecioDeCompra();
        }

        recetaRepository.save(receta);

        Producto producto = new Producto(nombre);
        producto.setReceta(receta);
        producto.setStockActual(0);
        producto.setPrecioInversion(precioInversionTotal);

        return productoRepository.save(producto);
    }


    @Override
    public List<ProductosDTO> obtenerProductos() {
        List<Producto> productos = productoRepository.findAll();

        return productos.stream().map(producto -> {
            List<InsumoRecetaResponseDTO> receta = new ArrayList<>();

            if (producto.getReceta() != null && producto.getReceta().getDetalles() != null) {
                receta = producto.getReceta().getDetalles().stream().map(detalle -> {
                    Insumo insumo = detalle.getInsumo();
                    return new InsumoRecetaResponseDTO(
                            insumo.getId(),
                            insumo.getNombre(),
                            insumo.getUnidadMedida(),
                            detalle.getCantidad()
                    );
                }).collect(Collectors.toList());
            }

            return new ProductosDTO(
                    producto.getId(),
                    producto.getNombre(),
                    producto.getStockActual(),
                    producto.getPrecioInversion(),
                    producto.getPrecioVenta(),
                    receta
            );
        }).collect(Collectors.toList());
    }

    @Override
    public Producto obtenerProductoPorId(Long id) {
        return productoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado con ID: " + id));
    }

    public void validar(CrearProductoConRecetaDTO dto) {
        if (dto.nombre() == null || dto.nombre().trim().isEmpty()) {
            throw new IllegalArgumentException("El nombre del producto es obligatorio y no puede estar vacío ni ser solo espacios.");
        }
        if (dto.insumos() == null || dto.insumos().isEmpty()) {
            throw new IllegalArgumentException("Debe proporcionar al menos un insumo para la receta.");
        }
        for (InsumoCantidadDTO insumo : dto.insumos()) {
            if (insumo.insumoId() == null || insumo.cantidad() <= 0) {
                throw new IllegalArgumentException("Cada insumo debe tener un ID válido y una cantidad mayor a 0.");
            }
        }
    }

    @Override
    @Transactional
    public Producto actualizarProducto(Long id, ActualizarProductoConRecetaDTO dto) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado con ID: " + id));

        // 📝 Actualizar nombre si viene uno válido
        if (dto.nombre() != null && !dto.nombre().trim().isEmpty()) {
            producto.setNombre(dto.nombre().trim());
        }

        if (dto.stockActual() != null) {
            producto.setStockActual(dto.stockActual());
        }

        if (dto.precioVenta() != null) {
            producto.setPrecioVenta(dto.precioVenta());
        }

        boolean actualizarReceta = dto.insumos() != null;

        if (actualizarReceta) {
            Receta receta = producto.getReceta();

            if (receta == null) {
                receta = new Receta();
                producto.setReceta(receta);
            } else {
                // 🔁 Eliminar detalles anteriores correctamente
                for (InsumoReceta detalle : new ArrayList<>(receta.getDetalles())) {
                    detalle.setReceta(null);
                    detalle.setInsumo(null);
                }
                receta.getDetalles().clear();
            }

            double nuevoPrecioInversion = 0;

            for (InsumoCantidadDTO insumoDTO : dto.insumos()) {
                Insumo insumo = insumoRepository.findById(insumoDTO.insumoId())
                        .orElseThrow(() -> new IllegalArgumentException("Insumo no encontrado: " + insumoDTO.insumoId()));

                InsumoReceta nuevoDetalle = new InsumoReceta(insumoDTO.cantidad());
                nuevoDetalle.setInsumo(insumo);
                nuevoDetalle.setReceta(receta);

                receta.getDetalles().add(nuevoDetalle);

                nuevoPrecioInversion += insumoDTO.cantidad() * insumo.getPrecioDeCompra();
            }

            producto.setPrecioInversion(nuevoPrecioInversion);
        } else if (dto.precioInversion() != null) {
            // Solo se actualiza si no se cambia la receta
            producto.setPrecioInversion(dto.precioInversion());
        }

        return productoRepository.save(producto);
    }

    @Override
    @Transactional
    public void eliminarProducto(Long id) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado con ID: " + id));
        // No permitir eliminar si tiene movimientos asociados
        if (productoRepository.existsInMovimientos(id)) {
            throw new IllegalArgumentException("No se puede eliminar el producto porque tiene movimientos registrados.");
        }
        productoRepository.delete(producto);
    }

}

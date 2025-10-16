package com.Latti.stock.service.impl;

import com.Latti.stock.dtos.CrearInsumoDTO;
import com.Latti.stock.dtos.InsumoResponseDTO;
import com.Latti.stock.dtos.InsumoListadoDTO;
import com.Latti.stock.modules.Insumo;
import com.Latti.stock.modules.DetalleMovimientoInsumo;
import com.Latti.stock.modules.UnidadMedida;
import com.Latti.stock.repositories.InsumoRepository;
import com.Latti.stock.service.InsumoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class InsumoServiceImplements implements InsumoService {

    @Autowired
    private InsumoRepository insumoRepository;

    @Override
    @Transactional
    public Insumo crearInsumo(CrearInsumoDTO dto) {
        validarCrearInsumoDTO(dto);

        String nombre = dto.nombre().trim();
        UnidadMedida unidad = dto.unidadMedida(); // ✅ ENUM, no necesita trim()

        // Validación de nombre único (ignorando mayúsculas/minúsculas)
        if (insumoRepository.existsByNombreIgnoreCase(nombre)) {
            throw new IllegalArgumentException("Ya existe un insumo con ese nombre.");
        }
        // ✅ Validación de unidad: solo verificar que no sea null
        if (unidad == null) {
            throw new IllegalArgumentException("La unidad de medida es obligatoria.");
        }

        Insumo nuevoInsumo = new Insumo(nombre, unidad);
        return insumoRepository.save(nuevoInsumo);
    }

    @Override
    public List<InsumoListadoDTO> obtenerInsumos() {
        return insumoRepository.findAll().stream()
                .map(insumo -> {
                    // Calcular el total invertido basado en el historial de movimientos
                    double totalInvertido = calcularTotalInvertido(insumo);
                    
                    return new InsumoListadoDTO(
                            insumo.getId(),
                            insumo.getNombre(),
                            insumo.getUnidadMedida(),
                            insumo.getTipo(),
                            insumo.getStockActual(),
                            insumo.getPrecioDeCompra(),
                            totalInvertido
                    );
                })
                .toList();
    }

    /**
     * Calcula el total invertido en un insumo basado en el historial de movimientos de entrada
     */
    private double calcularTotalInvertido(Insumo insumo) {
        return insumo.getMovimientos().stream()
                .filter(movimiento -> "ENTRADA".equals(movimiento.getMovimiento().getTipoMovimiento().toString()))
                .mapToDouble(movimiento -> {
                    // Para movimientos de entrada, el precioTotal es el costo de compra
                    double cantidad = movimiento.getCantidad();
                    double precioTotal = movimiento.getPrecioTotal();
                    return precioTotal;
                })
                .sum();
    }

    @Override
    @Transactional
    public Insumo actualizarInsumo(Long id, CrearInsumoDTO dto) {
        validarCrearInsumoDTO(dto);

        Insumo insumo = insumoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Insumo no encontrado con ID: " + id));

        String nombre = dto.nombre().trim();
        UnidadMedida unidad = dto.unidadMedida();

        // Validación de nombre único (ignorando mayúsculas/minúsculas y el propio insumo)
        if (insumoRepository.existsByNombreIgnoreCaseAndIdNot(nombre, id)) {
            throw new IllegalArgumentException("Ya existe un insumo con ese nombre.");
        }

        // Actualizar los campos
        insumo.setNombre(nombre);
        insumo.setUnidadMedida(unidad);

        return insumoRepository.save(insumo);
    }

    @Override
    @Transactional
    public void eliminarInsumo(Long id) {
        Insumo insumo = insumoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Insumo no encontrado con ID: " + id));
        // No permitir eliminar si está en uso en recetas o movimientos
        if (insumoRepository.existsInRecetas(id) || insumoRepository.existsInMovimientos(id)) {
            throw new IllegalArgumentException("No se puede eliminar el insumo porque está en uso en recetas o movimientos.");
        }
        insumoRepository.delete(insumo);
    }

    private void validarCrearInsumoDTO(CrearInsumoDTO dto) {
        if (dto.nombre() == null || dto.nombre().trim().isEmpty()) {
            throw new IllegalArgumentException("El nombre del insumo no puede estar vacío ni ser solo espacios.");
        }
        // ✅ Validación de unidad: solo verificar que no sea null
        if (dto.unidadMedida() == null) {
            throw new IllegalArgumentException("La unidad de medida es obligatoria.");
        }
    }
}

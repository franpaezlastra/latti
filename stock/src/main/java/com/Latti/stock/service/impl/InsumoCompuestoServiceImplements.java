package com.Latti.stock.service.impl;

import com.Latti.stock.dtos.CrearInsumoCompuestoDTO;
import com.Latti.stock.dtos.EnsamblarInsumoCompuestoDTO;
import com.Latti.stock.dtos.InsumoCompuestoResponseDTO;
import com.Latti.stock.modules.*;
import com.Latti.stock.repositories.InsumoRepository;
import com.Latti.stock.repositories.RecetaInsumoRepository;
import com.Latti.stock.service.InsumoCompuestoService;
import com.Latti.stock.service.MovimientoInsumoLoteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class InsumoCompuestoServiceImplements implements InsumoCompuestoService {

    @Autowired
    private InsumoRepository insumoRepository;

    @Autowired
    private RecetaInsumoRepository recetaInsumoRepository;

    @Autowired
    private MovimientoInsumoLoteService movimientoInsumoLoteService;

    @Override
    @Transactional
    public InsumoCompuestoResponseDTO crearInsumoCompuesto(CrearInsumoCompuestoDTO dto) {
        // Validaciones
        validarCrearInsumoCompuestoDTO(dto);

        String nombre = dto.nombre().trim();
        
        // Verificar que no exista un insumo con ese nombre
        if (insumoRepository.existsByNombreIgnoreCase(nombre)) {
            throw new IllegalArgumentException("Ya existe un insumo con ese nombre: " + nombre);
        }

        // Crear el insumo compuesto
        Insumo insumoCompuesto = new Insumo(nombre, dto.unidadMedida(), TipoInsumo.COMPUESTO);
        insumoCompuesto = insumoRepository.save(insumoCompuesto);

        // Crear la receta
        for (CrearInsumoCompuestoDTO.ComponenteRecetaDTO componenteDTO : dto.receta()) {
            Insumo insumoBase = insumoRepository.findById(componenteDTO.insumoBaseId())
                    .orElseThrow(() -> new IllegalArgumentException("Insumo base no encontrado: " + componenteDTO.insumoBaseId()));

            // Verificar que el insumo base sea realmente de tipo BASE
            if (!insumoBase.esBase()) {
                throw new IllegalArgumentException("El insumo " + insumoBase.getNombre() + " no es un insumo base válido");
            }

            // Verificar que no se duplique el insumo base en la receta
            boolean yaExiste = recetaInsumoRepository.findByInsumoCompuesto(insumoCompuesto)
                    .stream()
                    .anyMatch(receta -> receta.getInsumoBase().getId().equals(componenteDTO.insumoBaseId()));
            
            if (yaExiste) {
                throw new IllegalArgumentException("El insumo base " + insumoBase.getNombre() + " ya está en la receta");
            }

            RecetaInsumo recetaInsumo = new RecetaInsumo(insumoCompuesto, insumoBase, componenteDTO.cantidad());
            insumoCompuesto.addComponenteReceta(recetaInsumo);
        }

        insumoCompuesto = insumoRepository.save(insumoCompuesto);
        return convertirAInsumoCompuestoResponseDTO(insumoCompuesto);
    }

    @Override
    public List<InsumoCompuestoResponseDTO> obtenerInsumosCompuestos() {
        return insumoRepository.findAll().stream()
                .filter(Insumo::esCompuesto)
                .map(this::convertirAInsumoCompuestoResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public InsumoCompuestoResponseDTO obtenerInsumoCompuestoPorId(Long id) {
        Insumo insumo = insumoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Insumo no encontrado: " + id));

        if (!insumo.esCompuesto()) {
            throw new IllegalArgumentException("El insumo no es de tipo compuesto: " + id);
        }

        return convertirAInsumoCompuestoResponseDTO(insumo);
    }

    @Override
    @Transactional
    public InsumoCompuestoResponseDTO ensamblarInsumoCompuesto(Long insumoCompuestoId, EnsamblarInsumoCompuestoDTO dto) {
        Insumo insumoCompuesto = insumoRepository.findById(insumoCompuestoId)
                .orElseThrow(() -> new IllegalArgumentException("Insumo compuesto no encontrado: " + insumoCompuestoId));

        if (!insumoCompuesto.esCompuesto()) {
            throw new IllegalArgumentException("El insumo no es de tipo compuesto: " + insumoCompuestoId);
        }

        // Validar stock suficiente
        validarStockSuficienteParaEnsamblar(insumoCompuestoId, dto.cantidad());

        // Generar UUID único para este ensamble
        String ensambleId = UUID.randomUUID().toString();
        System.out.println("🔧 Ensamble ID generado: " + ensambleId);

        // Crear movimientos de salida para cada componente
        for (RecetaInsumo componente : insumoCompuesto.getReceta()) {
            Insumo insumoBase = componente.getInsumoBase();
            double cantidadNecesaria = componente.getCantidad() * dto.cantidad();

            // Crear movimiento de salida para el componente con ensambleId
            movimientoInsumoLoteService.crearMovimientoSalidaConEnsamble(
                    insumoBase.getId(),
                    cantidadNecesaria,
                    dto.fecha(),
                    dto.descripcion() + " (componente: " + insumoBase.getNombre() + ")",
                    ensambleId
            );
        }

        // Crear movimiento de entrada para el insumo compuesto
        // El precio se calcula sumando el costo de todos los componentes
        double precioTotalComponentes = calcularPrecioTotalComponentes(insumoCompuesto, dto.cantidad());
        
        movimientoInsumoLoteService.crearMovimientoEntradaConEnsamble(
                insumoCompuestoId,
                dto.cantidad(),
                precioTotalComponentes,
                dto.fecha(),
                dto.descripcion(),
                ensambleId
        );

        // ✅ CORREGIDO: El precio del insumo compuesto debe ser el precio POR UNIDAD, no el total
        // El precio por unidad se calcula sumando el costo de todos los componentes por unidad
        double precioPorUnidadCompuesto = calcularPrecioPorUnidadCompuesto(insumoCompuesto);
        insumoCompuesto.setPrecioDeCompra(precioPorUnidadCompuesto);
        insumoCompuesto = insumoRepository.save(insumoCompuesto);
        
        System.out.println("💰 Precio por unidad del insumo compuesto '" + insumoCompuesto.getNombre() + "': $" + precioPorUnidadCompuesto);

        return convertirAInsumoCompuestoResponseDTO(insumoCompuesto);
    }

    @Override
    @Transactional
    public InsumoCompuestoResponseDTO actualizarInsumoCompuesto(Long id, CrearInsumoCompuestoDTO dto) {
        // Validaciones
        validarCrearInsumoCompuestoDTO(dto);

        Insumo insumoCompuesto = insumoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Insumo compuesto no encontrado: " + id));

        if (!insumoCompuesto.esCompuesto()) {
            throw new IllegalArgumentException("El insumo no es de tipo compuesto: " + id);
        }

        String nombre = dto.nombre().trim();
        
        // Verificar que no exista otro insumo con ese nombre (excluyendo el actual)
        if (insumoRepository.existsByNombreIgnoreCaseAndIdNot(nombre, id)) {
            throw new IllegalArgumentException("Ya existe un insumo con ese nombre: " + nombre);
        }

        // Actualizar el insumo compuesto
        insumoCompuesto.setNombre(nombre);
        insumoCompuesto.setUnidadMedida(dto.unidadMedida());
        insumoCompuesto = insumoRepository.save(insumoCompuesto);

        // Limpiar la receta existente
        recetaInsumoRepository.deleteByInsumoCompuesto(insumoCompuesto);

        // Crear la nueva receta
        for (CrearInsumoCompuestoDTO.ComponenteRecetaDTO componenteDTO : dto.receta()) {
            Insumo insumoBase = insumoRepository.findById(componenteDTO.insumoBaseId())
                    .orElseThrow(() -> new IllegalArgumentException("Insumo base no encontrado: " + componenteDTO.insumoBaseId()));

            if (!insumoBase.esBase()) {
                throw new IllegalArgumentException("El insumo debe ser de tipo base: " + insumoBase.getNombre());
            }

            // Verificar que no se use a sí mismo como componente
            if (insumoBase.getId().equals(id)) {
                throw new IllegalArgumentException("Un insumo compuesto no puede ser componente de sí mismo");
            }

            RecetaInsumo recetaInsumo = new RecetaInsumo(insumoCompuesto, insumoBase, componenteDTO.cantidad());
            recetaInsumoRepository.save(recetaInsumo);
        }

        return convertirAInsumoCompuestoResponseDTO(insumoCompuesto);
    }

    @Override
    @Transactional
    public void eliminarInsumoCompuesto(Long id) {
        Insumo insumo = insumoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Insumo no encontrado: " + id));

        if (!insumo.esCompuesto()) {
            throw new IllegalArgumentException("El insumo no es de tipo compuesto: " + id);
        }

        // Verificar que no tenga stock
        if (insumo.getStockActual() > 0) {
            throw new IllegalArgumentException("No se puede eliminar un insumo compuesto que tiene stock. Stock actual: " + insumo.getStockActual());
        }

        // Verificar que no esté siendo usado en productos
        if (!insumo.getDetalles().isEmpty()) {
            throw new IllegalArgumentException("No se puede eliminar un insumo compuesto que está siendo usado en productos");
        }

        // Eliminar la receta primero
        recetaInsumoRepository.deleteByInsumoCompuesto(insumo);
        
        // Eliminar el insumo
        insumoRepository.delete(insumo);
    }

    @Override
    public void validarStockSuficienteParaEnsamblar(Long insumoCompuestoId, double cantidad) {
        Insumo insumoCompuesto = insumoRepository.findById(insumoCompuestoId)
                .orElseThrow(() -> new IllegalArgumentException("Insumo compuesto no encontrado: " + insumoCompuestoId));

        for (RecetaInsumo componente : insumoCompuesto.getReceta()) {
            Insumo insumoBase = componente.getInsumoBase();
            double cantidadNecesaria = componente.getCantidad() * cantidad;

            if (insumoBase.getStockActual() < cantidadNecesaria) {
                throw new IllegalArgumentException(
                        String.format("Stock insuficiente del componente '%s'. Stock actual: %.2f, Cantidad necesaria: %.2f",
                                insumoBase.getNombre(),
                                insumoBase.getStockActual(),
                                cantidadNecesaria)
                );
            }
        }
    }

    private void validarCrearInsumoCompuestoDTO(CrearInsumoCompuestoDTO dto) {
        if (dto.nombre() == null || dto.nombre().trim().isEmpty()) {
            throw new IllegalArgumentException("El nombre del insumo compuesto es obligatorio");
        }

        if (dto.unidadMedida() == null) {
            throw new IllegalArgumentException("La unidad de medida es obligatoria");
        }

        if (dto.receta() == null || dto.receta().isEmpty()) {
            throw new IllegalArgumentException("La receta debe tener al menos un componente");
        }

        // Validar que no haya componentes duplicados
        long componentesUnicos = dto.receta().stream()
                .map(CrearInsumoCompuestoDTO.ComponenteRecetaDTO::insumoBaseId)
                .distinct()
                .count();

        if (componentesUnicos != dto.receta().size()) {
            throw new IllegalArgumentException("No se puede duplicar un insumo base en la receta");
        }

        // Validar cantidades positivas
        for (CrearInsumoCompuestoDTO.ComponenteRecetaDTO componente : dto.receta()) {
            if (componente.cantidad() <= 0) {
                throw new IllegalArgumentException("La cantidad de cada componente debe ser mayor a 0");
            }
        }
    }

    private double calcularPrecioTotalComponentes(Insumo insumoCompuesto, double cantidad) {
        double precioTotal = 0;

        for (RecetaInsumo componente : insumoCompuesto.getReceta()) {
            Insumo insumoBase = componente.getInsumoBase();
            double cantidadNecesaria = componente.getCantidad() * cantidad;
            double precioUnitario = insumoBase.getPrecioDeCompra();
            precioTotal += cantidadNecesaria * precioUnitario;
        }

        return precioTotal;
    }

    /**
     * Calcula el precio por unidad de un insumo compuesto basado en el costo de sus componentes
     */
    private double calcularPrecioPorUnidadCompuesto(Insumo insumoCompuesto) {
        double precioPorUnidad = 0;

        for (RecetaInsumo componente : insumoCompuesto.getReceta()) {
            Insumo insumoBase = componente.getInsumoBase();
            double cantidadPorUnidad = componente.getCantidad(); // Cantidad necesaria para 1 unidad del compuesto
            double precioUnitarioComponente = insumoBase.getPrecioDeCompra();
            precioPorUnidad += cantidadPorUnidad * precioUnitarioComponente;
            
            System.out.println("  - Componente: " + insumoBase.getNombre() + 
                             " (cantidad: " + cantidadPorUnidad + 
                             ", precio unitario: $" + precioUnitarioComponente + 
                             ", costo: $" + (cantidadPorUnidad * precioUnitarioComponente) + ")");
        }

        return precioPorUnidad;
    }

    private InsumoCompuestoResponseDTO convertirAInsumoCompuestoResponseDTO(Insumo insumo) {
        List<InsumoCompuestoResponseDTO.ComponenteRecetaResponseDTO> recetaDTO = insumo.getReceta()
                .stream()
                .map(componente -> new InsumoCompuestoResponseDTO.ComponenteRecetaResponseDTO(
                        componente.getId(),
                        componente.getInsumoBase().getId(),
                        componente.getInsumoBase().getNombre(),
                        componente.getCantidad(),
                        componente.getInsumoBase().getUnidadMedida()
                ))
                .collect(Collectors.toList());

        return new InsumoCompuestoResponseDTO(
                insumo.getId(),
                insumo.getNombre(),
                insumo.getUnidadMedida(),
                insumo.getTipo(),
                insumo.getStockActual(),
                insumo.getPrecioDeCompra(),
                recetaDTO
        );
    }
}

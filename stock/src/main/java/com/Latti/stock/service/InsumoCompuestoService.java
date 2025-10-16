package com.Latti.stock.service;

import com.Latti.stock.dtos.CrearInsumoCompuestoDTO;
import com.Latti.stock.dtos.EnsamblarInsumoCompuestoDTO;
import com.Latti.stock.dtos.InsumoCompuestoResponseDTO;
import com.Latti.stock.modules.Insumo;

import java.util.List;

public interface InsumoCompuestoService {
    
    /**
     * Crear un nuevo insumo compuesto con su receta
     */
    InsumoCompuestoResponseDTO crearInsumoCompuesto(CrearInsumoCompuestoDTO dto);
    
    /**
     * Obtener todos los insumos compuestos
     */
    List<InsumoCompuestoResponseDTO> obtenerInsumosCompuestos();
    
    /**
     * Obtener un insumo compuesto por ID
     */
    InsumoCompuestoResponseDTO obtenerInsumoCompuestoPorId(Long id);
    
    /**
     * Ensamblar insumos compuestos (descontar componentes y agregar stock del compuesto)
     */
    InsumoCompuestoResponseDTO ensamblarInsumoCompuesto(Long insumoCompuestoId, EnsamblarInsumoCompuestoDTO dto);
    
    /**
     * Actualizar un insumo compuesto existente
     */
    InsumoCompuestoResponseDTO actualizarInsumoCompuesto(Long id, CrearInsumoCompuestoDTO dto);
    
    /**
     * Eliminar un insumo compuesto (solo si no tiene stock)
     */
    void eliminarInsumoCompuesto(Long id);
    
    /**
     * Validar si se puede ensamblar la cantidad solicitada
     */
    void validarStockSuficienteParaEnsamblar(Long insumoCompuestoId, double cantidad);
}

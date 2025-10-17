package com.Latti.stock.service;

import com.Latti.stock.dtos.CrearMovimientoDeInsumoDTO;
import com.Latti.stock.dtos.EditarMovimientoDeInsumoDTO;
import com.Latti.stock.dtos.ResponseMovimientosInsumoLoteDTO;
import com.Latti.stock.dtos.ValidacionEdicionDTO;
import com.Latti.stock.modules.MovimientoInsumoLote;

import java.util.List;

public interface MovimientoInsumoLoteService {
    MovimientoInsumoLote crearMovimientoInsumo(CrearMovimientoDeInsumoDTO crearMovimientoDeInsumoDTO);
    List<ResponseMovimientosInsumoLoteDTO> obtenerMovimientosDTO();
    MovimientoInsumoLote eliminarMovimientoInsumo(Long id);
    
    // Nuevos métodos para edición
    ValidacionEdicionDTO validarEdicionMovimiento(Long movimientoId);
    MovimientoInsumoLote editarMovimientoInsumo(EditarMovimientoDeInsumoDTO dto);
    
    // ✅ NUEVO: Métodos para insumos compuestos
    void crearMovimientoEntrada(Long insumoId, double cantidad, double precioTotal, java.time.LocalDate fecha, String descripcion);
    void crearMovimientoSalida(Long insumoId, double cantidad, java.time.LocalDate fecha, String descripcion);
    
    // ✅ NUEVO: Métodos para ensambles con tracking
    void crearMovimientoEntradaConEnsamble(Long insumoId, double cantidad, double precioTotal, java.time.LocalDate fecha, String descripcion, String ensambleId);
    void crearMovimientoSalidaConEnsamble(Long insumoId, double cantidad, java.time.LocalDate fecha, String descripcion, String ensambleId);
    
    // ✅ NUEVO: Método para validar si un movimiento es parte de un ensamble
    boolean esMovimientoDeEnsamble(Long movimientoId);
}

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
}

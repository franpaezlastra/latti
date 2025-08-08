package com.Latti.stock.service;

import com.Latti.stock.dtos.CrearMovimientoDeInsumoDTO;
import com.Latti.stock.dtos.CrearMovimientoProductoDTO;
import com.Latti.stock.dtos.CrearVentaPorLotesDTO;
import com.Latti.stock.dtos.ResponseMovimientosProductoLoteDTO;
import com.Latti.stock.dtos.StockPorLoteDTO;
import com.Latti.stock.modules.MovimientoProductoLote;

import java.util.List;

public interface MovimientoProductoLoteService {
    MovimientoProductoLote crearMovimientoProducto(CrearMovimientoProductoDTO crearMovimientoProductoDTO);

    List<ResponseMovimientosProductoLoteDTO> obtenerMovimientosDTO();

    MovimientoProductoLote eliminarMovimientoProducto(Long id);
    
    MovimientoProductoLote crearVentaPorLotes(CrearVentaPorLotesDTO dto);
    
    List<StockPorLoteDTO> obtenerStockPorLotes(Long productoId);
}

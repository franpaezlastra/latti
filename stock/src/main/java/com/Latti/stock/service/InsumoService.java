package com.Latti.stock.service;

import com.Latti.stock.dtos.CrearInsumoDTO;
import com.Latti.stock.dtos.InsumoResponseDTO;
import com.Latti.stock.dtos.InsumoListadoDTO;
import com.Latti.stock.modules.Insumo;
import com.Latti.stock.modules.InsumoReceta;

import java.util.List;

public interface InsumoService {
    Insumo crearInsumo(CrearInsumoDTO crearInsumoDTO);

    List<InsumoListadoDTO> obtenerInsumos();

    void eliminarInsumo(Long id);
}

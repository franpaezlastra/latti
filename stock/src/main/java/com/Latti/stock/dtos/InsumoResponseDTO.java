package com.Latti.stock.dtos;

import com.Latti.stock.modules.Insumo;

public class InsumoResponseDTO {
    private String mensaje;
    private Insumo insumo;

    public InsumoResponseDTO(String mensaje, Insumo insumo) {
        this.mensaje = mensaje;
        this.insumo = insumo;
    }

    public String getMensaje() { return mensaje; }
    public Insumo getInsumo() { return insumo; }
}
package com.Latti.stock.modules;

/**
 * ENUM para tipos de insumos
 * BASE: Insumos simples que se pueden comprar directamente
 * COMPUESTO: Insumos que se crean ensamblando otros insumos
 */
public enum TipoInsumo {
    BASE("Insumo Base"),
    COMPUESTO("Insumo Compuesto");

    private final String descripcion;

    TipoInsumo(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getDescripcion() {
        return descripcion;
    }
}

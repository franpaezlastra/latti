package com.Latti.stock.modules;

/**
 * ENUM para unidades de medida estandarizadas
 * Evita inconsistencias en el sistema
 */
public enum UnidadMedida {
    GRAMOS("g"),
    MILILITROS("ml"),
    UNIDADES("u");

    private final String abreviatura;

    UnidadMedida(String abreviatura) {
        this.abreviatura = abreviatura;
    }

    public String getAbreviatura() {
        return abreviatura;
    }

    public String getNombreCompleto() {
        switch (this) {
            case GRAMOS:
                return "Gramos";
            case MILILITROS:
                return "Mililitros";
            case UNIDADES:
                return "Unidades";
            default:
                return this.name();
        }
    }

    /**
     * Obtener el ENUM desde la abreviatura
     */
    public static UnidadMedida fromAbreviatura(String abreviatura) {
        if (abreviatura == null) return null;
        
        for (UnidadMedida unidad : values()) {
            if (unidad.abreviatura.equalsIgnoreCase(abreviatura.trim())) {
                return unidad;
            }
        }
        return null;
    }

    /**
     * Obtener el ENUM desde el nombre completo
     */
    public static UnidadMedida fromNombre(String nombre) {
        if (nombre == null) return null;
        
        for (UnidadMedida unidad : values()) {
            if (unidad.getNombreCompleto().equalsIgnoreCase(nombre.trim())) {
                return unidad;
            }
        }
        return null;
    }
}

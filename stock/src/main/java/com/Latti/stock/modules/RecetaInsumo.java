package com.Latti.stock.modules;

import jakarta.persistence.*;

/**
 * Entidad para representar los componentes de un insumo compuesto
 * Define qué insumos base y en qué cantidad se necesitan para crear un insumo compuesto
 */
@Entity
@Table(name = "receta_insumo")
public class RecetaInsumo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "insumo_compuesto_id", nullable = false)
    private Insumo insumoCompuesto;

    @ManyToOne
    @JoinColumn(name = "insumo_base_id", nullable = false)
    private Insumo insumoBase;

    private double cantidad;

    public RecetaInsumo() {}

    public RecetaInsumo(Insumo insumoCompuesto, Insumo insumoBase, double cantidad) {
        this.insumoCompuesto = insumoCompuesto;
        this.insumoBase = insumoBase;
        this.cantidad = cantidad;
    }

    public Long getId() {
        return id;
    }

    public Insumo getInsumoCompuesto() {
        return insumoCompuesto;
    }

    public void setInsumoCompuesto(Insumo insumoCompuesto) {
        this.insumoCompuesto = insumoCompuesto;
    }

    public Insumo getInsumoBase() {
        return insumoBase;
    }

    public void setInsumoBase(Insumo insumoBase) {
        this.insumoBase = insumoBase;
    }

    public double getCantidad() {
        return cantidad;
    }

    public void setCantidad(double cantidad) {
        this.cantidad = cantidad;
    }
}

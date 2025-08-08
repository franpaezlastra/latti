package com.Latti.stock.modules;

import jakarta.persistence.*;

@Entity
public class InsumoReceta {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private double cantidad;

    @ManyToOne
    @JoinColumn(name = "receta_id")
    private Receta receta;

    @ManyToOne
    @JoinColumn(name = "insumo_id")
    private Insumo insumo;

    public InsumoReceta() {}

    public InsumoReceta(double cantidad) {
        this.cantidad = cantidad;

    }

    public Long getId() { return id; }
    public double getCantidad() { return cantidad; }
    public void setCantidad(double cantidad) { this.cantidad = cantidad; }
    public Receta getReceta() { return receta; }
    public void setReceta(Receta receta) { this.receta = receta; }
    public Insumo getInsumo() { return insumo; }
    public void setInsumo(Insumo insumo) { this.insumo = insumo; }
}
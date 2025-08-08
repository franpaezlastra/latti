package com.Latti.stock.modules;

import jakarta.persistence.*;

@Entity
public class DetalleMovimientoInsumo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private double cantidad;
    private double precioTotal;


    @ManyToOne
    @JoinColumn(name = "insumo_id")
    private Insumo insumo;

    @ManyToOne
    @JoinColumn(name = "movimiento_id")
    private MovimientoInsumoLote movimiento;

    public DetalleMovimientoInsumo() {}

    public DetalleMovimientoInsumo(double cantidad) {
        this.cantidad = cantidad;


    }

    public Long getId() { return id; }
    public double getCantidad() { return cantidad; }
    public void setCantidad(double cantidad) { this.cantidad = cantidad; }
    public double getPrecioTotal() { return precioTotal; }
    public void setPrecioTotal(double precioTotal) { this.precioTotal = precioTotal; }
    public Insumo getInsumo() { return insumo; }
    public void setInsumo(Insumo insumo) { this.insumo = insumo; }
    public MovimientoInsumoLote getMovimiento() { return movimiento; }
    public void setMovimiento(MovimientoInsumoLote movimiento) { this.movimiento = movimiento; }
}
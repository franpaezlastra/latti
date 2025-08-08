package com.Latti.stock.modules;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
public class Producto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;

    private double stockActual = 0;

    private double precioInversion = 0;
    private double precioVenta = 0;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "receta_id")
    private Receta receta;

    @OneToMany(mappedBy = "producto", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DetalleMovimientoProducto> movimientos = new ArrayList<>();

    public Producto() {}

    public Producto(String nombre) {
        this.nombre = nombre;
    }

    public Long getId() { return id; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public double getStockActual() { return stockActual; }
    public void setStockActual(double stockActual) { this.stockActual = stockActual; }

    public double getPrecioInversion() { return precioInversion; }
    public void setPrecioInversion(double precioInversion) { this.precioInversion = precioInversion; }

    public double getPrecioVenta() { return precioVenta; }
    public void setPrecioVenta(double precioVenta) { this.precioVenta = precioVenta; }

    public Receta getReceta() { return receta; }
    public void setReceta(Receta receta) { this.receta = receta; }

    public List<DetalleMovimientoProducto> getMovimientos() { return movimientos; }
    public void setMovimientos(List<DetalleMovimientoProducto> movimientos) { this.movimientos = movimientos; }

    public void addMovimiento(DetalleMovimientoProducto detalle) {
        detalle.setProducto(this);
        this.movimientos.add(detalle);
    }
}

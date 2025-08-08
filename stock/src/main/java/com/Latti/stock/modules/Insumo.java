package com.Latti.stock.modules;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
public class Insumo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;
    private String unidadMedida;
    private double stockActual = 0;
    private double precioDeCompra = 0;

    @OneToMany(mappedBy = "insumo")
    private List<InsumoReceta> detalles = new ArrayList<>();

    @OneToMany(mappedBy = "insumo", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DetalleMovimientoInsumo> movimientos = new ArrayList<>();

    public Insumo() {}

    public Insumo(String nombre, String unidadMedida) {
        this.nombre = nombre;
        this.unidadMedida = unidadMedida;

    }

    public Long getId() { return id; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getUnidadMedida() { return unidadMedida; }
    public void setUnidadMedida(String unidadMedida) { this.unidadMedida = unidadMedida; }
    public double getStockActual() { return stockActual; }
    public void setStockActual(double stockActual) { this.stockActual = stockActual; }
    public List<InsumoReceta> getDetalles() { return detalles; }
    public void setDetalles(List<InsumoReceta> detalles) { this.detalles = detalles; }
    public List<DetalleMovimientoInsumo> getMovimientos() { return movimientos; }
    public void setMovimientos(List<DetalleMovimientoInsumo> movimientos) { this.movimientos = movimientos; }

    public double getPrecioDeCompra() {
        return precioDeCompra;
    }

    public void setPrecioDeCompra(double precioDeCompra) {
        this.precioDeCompra = precioDeCompra;
    }

    public void addDetalleReceta(InsumoReceta detalle) {
        detalle.setInsumo(this);
        this.detalles.add(detalle);
    }

    public void addMovimiento(DetalleMovimientoInsumo movimiento) {
        movimiento.setInsumo(this);
        this.movimientos.add(movimiento);
    }
}
package com.Latti.stock.modules;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
public class DetalleMovimientoProducto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private double cantidad;

    private LocalDate fechaVencimiento;

    private String lote;
    
    // ✅ NUEVO: Precio de venta usado en este movimiento específico
    // Permite mantener historial de precios por venta
    private Double precioVenta;

    @ManyToOne
    @JoinColumn(name = "producto_id")
    private Producto producto;

    @ManyToOne
    @JoinColumn(name = "movimiento_id")
    private MovimientoProductoLote movimiento;

    public DetalleMovimientoProducto() {
    }

    public DetalleMovimientoProducto(double cantidad, Producto producto) {
        this.cantidad = cantidad;
        this.producto = producto;
    }

    public Long getId() {
        return id;
    }

    public double getCantidad() {
        return cantidad;
    }

    public void setCantidad(double cantidad) {
        this.cantidad = cantidad;
    }

    public LocalDate getFechaVencimiento() { 
        return fechaVencimiento; 
    }
    
    public void setFechaVencimiento(LocalDate fechaVencimiento) { 
        this.fechaVencimiento = fechaVencimiento; 
    }

    public String getLote() {
        return lote;
    }

    public void setLote(String lote) {
        this.lote = lote;
    }

    public Producto getProducto() {
        return producto;
    }

    public void setProducto(Producto producto) {
        this.producto = producto;
    }

    public MovimientoProductoLote getMovimiento() {
        return movimiento;
    }

    public void setMovimiento(MovimientoProductoLote movimiento) {
        this.movimiento = movimiento;
    }
    
    // ✅ NUEVO: Getters y setters para precioVenta
    public Double getPrecioVenta() {
        return precioVenta;
    }
    
    public void setPrecioVenta(Double precioVenta) {
        this.precioVenta = precioVenta;
    }
}

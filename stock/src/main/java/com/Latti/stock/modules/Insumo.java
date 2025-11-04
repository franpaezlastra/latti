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
    
    // ✅ CAMBIADO: Usar ENUM en lugar de String
    @Enumerated(EnumType.STRING)
    private UnidadMedida unidadMedida;
    
    // ✅ NUEVO: Tipo de insumo (BASE o COMPUESTO)
    @Enumerated(EnumType.STRING)
    private TipoInsumo tipo = TipoInsumo.BASE;
    
    private double stockActual = 0;
    private double precioDeCompra = 0;
    
    // ✅ NUEVO: Stock mínimo para alertas de stock bajo
    private double stockMinimo = 0;

    @OneToMany(mappedBy = "insumo")
    private List<InsumoReceta> detalles = new ArrayList<>();

    @OneToMany(mappedBy = "insumo", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DetalleMovimientoInsumo> movimientos = new ArrayList<>();

    // ✅ NUEVO: Receta para insumos compuestos (componentes que forman este insumo)
    @OneToMany(mappedBy = "insumoCompuesto", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RecetaInsumo> receta = new ArrayList<>();

    // ✅ NUEVO: Referencias como componente en otros insumos compuestos
    @OneToMany(mappedBy = "insumoBase", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RecetaInsumo> componenteEn = new ArrayList<>();

    public Insumo() {}

    public Insumo(String nombre, UnidadMedida unidadMedida) {
        this.nombre = nombre;
        this.unidadMedida = unidadMedida;
        this.tipo = TipoInsumo.BASE; // Por defecto es BASE
    }

    public Insumo(String nombre, UnidadMedida unidadMedida, TipoInsumo tipo) {
        this.nombre = nombre;
        this.unidadMedida = unidadMedida;
        this.tipo = tipo;
    }

    public Long getId() { return id; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    
    // ✅ GETTERS Y SETTERS PARA ENUM
    public UnidadMedida getUnidadMedida() { return unidadMedida; }
    public void setUnidadMedida(UnidadMedida unidadMedida) { this.unidadMedida = unidadMedida; }
    
    public TipoInsumo getTipo() { return tipo; }
    public void setTipo(TipoInsumo tipo) { this.tipo = tipo; }
    
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

    public double getStockMinimo() {
        return stockMinimo;
    }

    public void setStockMinimo(double stockMinimo) {
        this.stockMinimo = stockMinimo;
    }

    // ✅ NUEVO: Método para verificar si el stock está bajo
    public boolean tieneStockBajo() {
        return stockActual <= stockMinimo;
    }

    public void addDetalleReceta(InsumoReceta detalle) {
        detalle.setInsumo(this);
        this.detalles.add(detalle);
    }

    public void addMovimiento(DetalleMovimientoInsumo movimiento) {
        movimiento.setInsumo(this);
        this.movimientos.add(movimiento);
    }

    // ✅ NUEVO: Getters y setters para receta
    public List<RecetaInsumo> getReceta() { return receta; }
    public void setReceta(List<RecetaInsumo> receta) { this.receta = receta; }
    
    public List<RecetaInsumo> getComponenteEn() { return componenteEn; }
    public void setComponenteEn(List<RecetaInsumo> componenteEn) { this.componenteEn = componenteEn; }

    public void addComponenteReceta(RecetaInsumo componente) {
        componente.setInsumoCompuesto(this);
        this.receta.add(componente);
    }

    // ✅ NUEVO: Método para verificar si es insumo compuesto
    public boolean esCompuesto() {
        return TipoInsumo.COMPUESTO.equals(this.tipo);
    }

    // ✅ NUEVO: Método para verificar si es insumo base
    public boolean esBase() {
        return TipoInsumo.BASE.equals(this.tipo);
    }
}
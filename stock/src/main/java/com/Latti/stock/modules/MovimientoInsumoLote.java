package com.Latti.stock.modules;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
public class MovimientoInsumoLote {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate fecha;
    private String descripcion;

    @Enumerated(EnumType.STRING)
    private TipoMovimiento tipoMovimiento;

    @OneToMany(mappedBy = "movimiento", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DetalleMovimientoInsumo> detalles = new ArrayList<>();

    public MovimientoInsumoLote() {}

    public MovimientoInsumoLote(LocalDate fecha, String descripcion, TipoMovimiento tipoMovimiento) {
        this.fecha = fecha;
        this.descripcion = descripcion;
        this.tipoMovimiento = tipoMovimiento;
    }

    public Long getId() { return id; }
    public LocalDate getFecha() { return fecha; }
    public void setFecha(LocalDate fecha) { this.fecha = fecha; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    public List<DetalleMovimientoInsumo> getDetalles() { return detalles; }
    public void setDetalles(List<DetalleMovimientoInsumo> detalles) { this.detalles = detalles; }

    public TipoMovimiento getTipoMovimiento() {
        return tipoMovimiento;
    }

    public void setTipoMovimiento(TipoMovimiento tipoMovimiento) {
        this.tipoMovimiento = tipoMovimiento;
    }

    public void addDetalle(DetalleMovimientoInsumo detalle) {
        detalle.setMovimiento(this);
        this.detalles.add(detalle);
    }
}

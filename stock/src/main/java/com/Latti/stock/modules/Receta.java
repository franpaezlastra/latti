package com.Latti.stock.modules;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
public class Receta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(mappedBy = "receta")
    private Producto producto;

    @OneToMany(mappedBy = "receta", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<InsumoReceta> detalles = new ArrayList<>();

    public Receta() {}

    public Long getId() { return id; }

    public Producto getProducto() { return producto; }
    public void setProducto(Producto producto) { this.producto = producto; }

    public List<InsumoReceta> getDetalles() { return detalles; }
    public void setDetalles(List<InsumoReceta> detalles) { this.detalles = detalles; }

    public void addDetalle(InsumoReceta detalle) {
        detalle.setReceta(this);
        this.detalles.add(detalle);
    }
}

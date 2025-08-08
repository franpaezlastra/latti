package com.Latti.stock.repositories;


import com.Latti.stock.modules.DetalleMovimientoProducto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DetalleMovimientoProductoRepository extends JpaRepository<DetalleMovimientoProducto, Long> {
}
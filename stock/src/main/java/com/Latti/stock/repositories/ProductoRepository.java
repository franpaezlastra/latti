package com.Latti.stock.repositories;


import com.Latti.stock.modules.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProductoRepository extends JpaRepository<Producto, Long> {
    boolean existsByNombreIgnoreCase(String nombre);

    @Query("SELECT COUNT(m) > 0 FROM Producto p JOIN p.movimientos m WHERE p.id = :productoId")
    boolean existsInMovimientos(@Param("productoId") Long productoId);
}
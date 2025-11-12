package com.Latti.stock.repositories;


import com.Latti.stock.modules.DetalleMovimientoProducto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface DetalleMovimientoProductoRepository extends JpaRepository<DetalleMovimientoProducto, Long> {
    // ✅ NUEVO: Método para eliminar detalles por movimientoId
    @Modifying
    @Query("DELETE FROM DetalleMovimientoProducto d WHERE d.movimiento.id = :movimientoId")
    void deleteByMovimientoId(@Param("movimientoId") Long movimientoId);
}
package com.Latti.stock.repositories;

import com.Latti.stock.modules.Insumo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface InsumoRepository extends JpaRepository<Insumo, Long> {
    boolean existsByNombreIgnoreCase(String nombre);

    @Query("SELECT COUNT(r) > 0 FROM Insumo i JOIN i.detalles r WHERE i.id = :insumoId")
    boolean existsInRecetas(@Param("insumoId") Long insumoId);

    @Query("SELECT COUNT(m) > 0 FROM Insumo i JOIN i.movimientos m WHERE i.id = :insumoId")
    boolean existsInMovimientos(@Param("insumoId") Long insumoId);
}

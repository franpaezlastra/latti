package com.Latti.stock.repositories;

import com.Latti.stock.modules.DetalleMovimientoInsumo;
import com.Latti.stock.modules.Insumo;
import com.Latti.stock.modules.TipoMovimiento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DetalleMovimientoInsumoRepository extends JpaRepository<DetalleMovimientoInsumo, Long> {
    List<DetalleMovimientoInsumo> findByInsumoAndMovimiento_TipoMovimiento(Insumo insumo, TipoMovimiento tipoMovimiento);
    
    @Modifying
    @Query("DELETE FROM DetalleMovimientoInsumo d WHERE d.movimiento.id = :movimientoId")
    void deleteByMovimientoId(@Param("movimientoId") Long movimientoId);
}

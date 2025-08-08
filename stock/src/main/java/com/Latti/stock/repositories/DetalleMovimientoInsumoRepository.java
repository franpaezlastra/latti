package com.Latti.stock.repositories;

import com.Latti.stock.modules.DetalleMovimientoInsumo;
import com.Latti.stock.modules.Insumo;
import com.Latti.stock.modules.TipoMovimiento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DetalleMovimientoInsumoRepository extends JpaRepository<DetalleMovimientoInsumo, Long> {
    List<DetalleMovimientoInsumo> findByInsumoAndMovimiento_TipoMovimiento(Insumo insumo, TipoMovimiento tipoMovimiento);
}

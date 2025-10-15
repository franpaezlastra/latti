package com.Latti.stock.repositories;

import com.Latti.stock.modules.Insumo;
import com.Latti.stock.modules.RecetaInsumo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecetaInsumoRepository extends JpaRepository<RecetaInsumo, Long> {
    
    /**
     * Buscar todos los componentes de un insumo compuesto
     */
    List<RecetaInsumo> findByInsumoCompuesto(Insumo insumoCompuesto);
    
    /**
     * Buscar todos los insumos compuestos que usan un insumo base específico
     */
    List<RecetaInsumo> findByInsumoBase(Insumo insumoBase);
    
    /**
     * Verificar si un insumo base está siendo usado en algún insumo compuesto
     */
    boolean existsByInsumoBase(Insumo insumoBase);
    
    /**
     * Eliminar todos los componentes de un insumo compuesto
     */
    void deleteByInsumoCompuesto(Insumo insumoCompuesto);
}

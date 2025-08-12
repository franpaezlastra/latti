package com.Latti.stock.service.impl;

import com.Latti.stock.modules.Insumo;
import com.Latti.stock.modules.UnidadMedida;
import com.Latti.stock.repositories.InsumoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Servicio para migrar unidades de medida existentes al nuevo ENUM
 * Solo ejecutar una vez después de implementar el ENUM
 */
@Service
public class MigracionUnidadMedidaService {

    @Autowired
    private InsumoRepository insumoRepository;

    // Mapeo de unidades antiguas a nuevas
    private static final Map<String, UnidadMedida> MAPEO_UNIDADES = new HashMap<>();
    
    static {
        // Gramos
        MAPEO_UNIDADES.put("g", UnidadMedida.GRAMOS);
        MAPEO_UNIDADES.put("gr", UnidadMedida.GRAMOS);
        MAPEO_UNIDADES.put("gramos", UnidadMedida.GRAMOS);
        MAPEO_UNIDADES.put("gramo", UnidadMedida.GRAMOS);
        MAPEO_UNIDADES.put("kg", UnidadMedida.GRAMOS); // 1 kg = 1000 g
        MAPEO_UNIDADES.put("kilos", UnidadMedida.GRAMOS);
        MAPEO_UNIDADES.put("kilogramos", UnidadMedida.GRAMOS);
        
        // Mililitros
        MAPEO_UNIDADES.put("ml", UnidadMedida.MILILITROS);
        MAPEO_UNIDADES.put("mililitros", UnidadMedida.MILILITROS);
        MAPEO_UNIDADES.put("litros", UnidadMedida.MILILITROS); // 1 L = 1000 ml
        MAPEO_UNIDADES.put("l", UnidadMedida.MILILITROS);
        
        // Unidades
        MAPEO_UNIDADES.put("u", UnidadMedida.UNIDADES);
        MAPEO_UNIDADES.put("unidades", UnidadMedida.UNIDADES);
        MAPEO_UNIDADES.put("unidad", UnidadMedida.UNIDADES);
        MAPEO_UNIDADES.put("pzas", UnidadMedida.UNIDADES);
        MAPEO_UNIDADES.put("piezas", UnidadMedida.UNIDADES);
    }

    /**
     * Migra todos los insumos existentes al nuevo ENUM
     * ⚠️ SOLO EJECUTAR UNA VEZ
     */
    @Transactional
    public void migrarUnidadesMedida() {
        System.out.println("🔄 Iniciando migración de unidades de medida...");
        
        List<Insumo> insumos = insumoRepository.findAll();
        int migrados = 0;
        int conProblemas = 0;
        
        for (Insumo insumo : insumos) {
            try {
                // Obtener la unidad actual (debe ser String por ahora)
                String unidadActual = insumo.getUnidadMedida().toString();
                
                // Buscar en el mapeo
                UnidadMedida nuevaUnidad = MAPEO_UNIDADES.get(unidadActual.toLowerCase());
                
                if (nuevaUnidad != null) {
                    insumo.setUnidadMedida(nuevaUnidad);
                    insumoRepository.save(insumo);
                    migrados++;
                    System.out.println("✅ Migrado: " + insumo.getNombre() + " - " + unidadActual + " → " + nuevaUnidad.getAbreviatura());
                } else {
                    conProblemas++;
                    System.out.println("❌ No se pudo mapear: " + insumo.getNombre() + " - " + unidadActual);
                }
            } catch (Exception e) {
                conProblemas++;
                System.err.println("❌ Error migrando " + insumo.getNombre() + ": " + e.getMessage());
            }
        }
        
        System.out.println("🎯 Migración completada:");
        System.out.println("   ✅ Migrados: " + migrados);
        System.out.println("   ❌ Con problemas: " + conProblemas);
        System.out.println("   📊 Total: " + insumos.size());
    }

    /**
     * Obtiene el mapeo de unidades para referencia
     */
    public Map<String, UnidadMedida> getMapeoUnidades() {
        return new HashMap<>(MAPEO_UNIDADES);
    }
}


-- Script para limpiar movimientos duplicados existentes
-- Ejecutar en la base de datos para limpiar los datos corruptos

-- 1. Ver movimientos con detalles duplicados
SELECT 
    m.id as movimiento_id,
    m.fecha,
    m.descripcion,
    COUNT(d.id) as cantidad_detalles,
    GROUP_CONCAT(d.id) as detalle_ids
FROM movimiento_insumo_lote m
LEFT JOIN detalle_movimiento_insumo d ON m.id = d.movimiento_id
GROUP BY m.id
HAVING COUNT(d.id) > 1
ORDER BY m.id;

-- 2. Eliminar detalles duplicados (mantener solo el primero)
DELETE d1 FROM detalle_movimiento_insumo d1
INNER JOIN detalle_movimiento_insumo d2 
WHERE d1.id > d2.id 
AND d1.movimiento_id = d2.movimiento_id 
AND d1.insumo_id = d2.insumo_id;

-- 3. Verificar que se limpiaron los duplicados
SELECT 
    m.id as movimiento_id,
    m.fecha,
    m.descripcion,
    COUNT(d.id) as cantidad_detalles
FROM movimiento_insumo_lote m
LEFT JOIN detalle_movimiento_insumo d ON m.id = d.movimiento_id
GROUP BY m.id
ORDER BY m.id;

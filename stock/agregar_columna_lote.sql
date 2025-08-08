-- Script para agregar la columna lote a la tabla detalle_movimiento_producto
-- Ejecutar este script en la base de datos MySQL

USE stock;

-- Agregar la columna lote a la tabla detalle_movimiento_producto
ALTER TABLE detalle_movimiento_producto 
ADD COLUMN lote VARCHAR(255) NULL;

-- Comentario: La columna lote será generada automáticamente para movimientos de ENTRADA
-- basándose en el ID del movimiento (ejemplo: "LOTE-123") 
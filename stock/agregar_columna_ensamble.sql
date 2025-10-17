-- Script para agregar la columna ensamble_id a la tabla detalle_movimiento_insumo
-- Este campo rastrea qué movimientos pertenecen a un ensamble específico

ALTER TABLE detalle_movimiento_insumo 
ADD COLUMN ensamble_id VARCHAR(255);

-- Crear índice para mejorar el rendimiento de las consultas
CREATE INDEX idx_detalle_movimiento_ensamble_id ON detalle_movimiento_insumo(ensamble_id);

-- Comentario para documentar el propósito de la columna
COMMENT ON COLUMN detalle_movimiento_insumo.ensamble_id IS 'UUID del ensamble al que pertenece este movimiento. NULL para movimientos regulares, no-null para movimientos de ensamble de insumos compuestos';

-- Script de inicialización de la base de datos Latti Stock
-- Este script se ejecuta automáticamente al crear el contenedor

-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_insumo_nombre ON insumo(nombre);
CREATE INDEX IF NOT EXISTS idx_producto_nombre ON producto(nombre);
CREATE INDEX IF NOT EXISTS idx_movimiento_fecha ON movimiento_insumo_lote(fecha);

-- Crear vistas útiles para reportes
CREATE OR REPLACE VIEW v_stock_insumos AS
SELECT 
    i.id,
    i.nombre,
    i.unidad_medida,
    i.stock_actual,
    i.precio_de_compra,
    (i.stock_actual * i.precio_de_compra) as valor_total
FROM insumo i
ORDER BY i.stock_actual ASC;

CREATE OR REPLACE VIEW v_movimientos_recientes AS
SELECT 
    mil.id,
    mil.fecha,
    mil.descripcion,
    mil.tipo_movimiento,
    COUNT(dmi.id) as cantidad_insumos
FROM movimiento_insumo_lote mil
LEFT JOIN detalle_movimiento_insumo dmi ON mil.id = dmi.movimiento_id
GROUP BY mil.id, mil.fecha, mil.descripcion, mil.tipo_movimiento
ORDER BY mil.fecha DESC;

-- Insertar datos de ejemplo (opcional)
INSERT INTO insumo (nombre, unidad_medida, stock_actual, precio_de_compra) VALUES
('Harina de Trigo', 'GRAMOS', 10000, 0.001),
('Azúcar', 'GRAMOS', 5000, 0.002),
('Huevos', 'UNIDADES', 100, 0.5),
('Leche', 'MILILITROS', 5000, 0.001)
ON CONFLICT (nombre) DO NOTHING;

-- Crear usuario para la aplicación (si no existe)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'latti_app') THEN
        CREATE ROLE latti_app WITH LOGIN PASSWORD 'latti_app_password';
    END IF;
END
$$;

-- Otorgar permisos
GRANT CONNECT ON DATABASE latti_stock TO latti_app;
GRANT USAGE ON SCHEMA public TO latti_app;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO latti_app;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO latti_app;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO latti_app;

-- Configurar permisos para tablas futuras
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO latti_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO latti_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO latti_app;

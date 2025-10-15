# Implementación de Insumos Compuestos

## Descripción General

Se ha implementado un sistema completo para gestionar insumos compuestos que permite:
- Crear insumos compuestos a partir de insumos base (ej: "Botella Armada" = botella + tapa + etiquetas)
- Ensamblar insumos compuestos consumiendo stock de componentes
- Usar insumos compuestos en recetas de productos finales
- Calcular automáticamente el costo de los insumos compuestos

## Arquitectura

### Backend

#### Entidades Creadas

1. **TipoInsumo.java** (Enum)
   - `BASE`: Insumos simples que se compran directamente
   - `COMPUESTO`: Insumos que se arman a partir de otros insumos base

2. **RecetaInsumoCompuesto.java**
   - Relación entre insumo compuesto y sus componentes
   - Campos: `insumoCompuesto`, `insumoBase`, `cantidad`, `unidadMedida`

3. **Insumo.java** (Modificado)
   - Agregado campo `tipo` (TipoInsumo)
   - Agregada relación `recetaCompuesto` (List<RecetaInsumoCompuesto>)

#### DTOs Creados

1. **ComponenteRecetaDTO**: Define un componente en la receta
2. **CrearInsumoCompuestoDTO**: Datos para crear insumo compuesto
3. **EnsamblarInsumoCompuestoDTO**: Datos para ensamblar
4. **ComponenteRecetaResponseDTO**: Respuesta de componente
5. **ResponseInsumoCompuestoDTO**: Respuesta completa con receta

#### Servicios

**InsumoCompuestoService** (`InsumoCompuestoServiceImplements.java`)

Métodos principales:
- `crearInsumoCompuesto(CrearInsumoCompuestoDTO)`: Crea un insumo compuesto con su receta
- `ensamblarInsumoCompuesto(Long id, EnsamblarInsumoCompuestoDTO)`: Ensambla el insumo
  - Valida stock de componentes
  - Crea movimiento de SALIDA para componentes
  - Crea movimiento de ENTRADA para insumo compuesto
  - Calcula costo unitario automáticamente
- `obtenerInsumosCompuestos()`: Lista todos los insumos compuestos
- `obtenerInsumoCompuestoPorId(Long id)`: Obtiene un insumo compuesto específico

#### Controlador

**InsumoCompuestoController.java**

Endpoints REST:
- `POST /api/insumo-compuesto`: Crear insumo compuesto
- `POST /api/insumo-compuesto/{id}/ensamblar`: Ensamblar insumo
- `GET /api/insumo-compuesto`: Listar insumos compuestos
- `GET /api/insumo-compuesto/{id}`: Obtener insumo compuesto por ID

### Frontend

#### Redux (Actions)

**insumoActions.js**

Acciones creadas:
- `createInsumoCompuesto`: Crear insumo compuesto
- `ensamblarInsumoCompuesto`: Ensamblar insumo
- `loadInsumosCompuestos`: Cargar lista de insumos compuestos

#### Redux (Reducer)

**insumosReducer.js**

Estados agregados:
- `insumosCompuestos`: Array de insumos compuestos
- `compuestosStatus`, `compuestosError`
- `createCompuestoStatus`, `createCompuestoError`
- `ensamblarStatus`, `ensamblarError`

#### Componentes (Modales)

1. **InsumoCompuestoCreateModal.jsx**
   - Formulario para crear insumo compuesto
   - Selector de insumos base para la receta
   - Validaciones de duplicados y cantidades
   - Muestra unidad de medida de cada componente

2. **EnsamblarInsumoCompuestoModal.jsx**
   - Formulario para ensamblar insumo compuesto
   - Muestra consumo estimado de componentes
   - Muestra stock y precio actual
   - Campos: cantidad, fecha, descripción

#### Página Principal

**Insumos.jsx**

Características:
- Vista de pestañas (Insumos Base / Insumos Compuestos)
- Tabla de insumos base
- Cards de insumos compuestos con su receta
- Botones para crear y ensamblar
- Integración completa con modales

## Flujo de Trabajo

### 1. Crear Insumos Base

```
POST /api/insumos
{
  "nombre": "Botella",
  "unidadMedida": "UNIDADES"
}
```

Repetir para: Tapa, Etiqueta Tapa, Etiqueta Botella, Café, Leche, etc.

### 2. Cargar Stock de Insumos Base

```
POST /api/movimiento-insumo
{
  "fecha": "2024-01-15",
  "descripcion": "Compra inicial",
  "tipoMovimiento": "ENTRADA",
  "detalles": [
    { "insumoId": 1, "cantidad": 100, "precio": 18 },
    { "insumoId": 2, "cantidad": 100, "precio": 5 }
  ]
}
```

### 3. Crear Insumo Compuesto "Botella Armada"

```
POST /api/insumo-compuesto
{
  "nombre": "Botella Armada",
  "unidadMedida": "UNIDADES",
  "receta": [
    { "insumoBaseId": 1, "cantidad": 1 },  // Botella
    { "insumoBaseId": 2, "cantidad": 1 },  // Tapa
    { "insumoBaseId": 3, "cantidad": 1 },  // Etiqueta Tapa
    { "insumoBaseId": 4, "cantidad": 1 }   // Etiqueta Botella
  ]
}
```

### 4. Ensamblar 50 Botellas Armadas

```
POST /api/insumo-compuesto/5/ensamblar
{
  "cantidad": 50,
  "fecha": "2024-01-15",
  "descripcion": "Juan armó botellas"
}
```

**Resultado:**
- Stock de componentes: -50 cada uno (SALIDA)
- Stock de "Botella Armada": +50 (ENTRADA)
- Precio unitario calculado: suma de costos de componentes

### 5. Crear Producto con Botella Armada

```
POST /api/productos
{
  "nombre": "Café Suave",
  "insumos": [
    { "insumoId": 5, "cantidad": 1 },   // Botella Armada
    { "insumoId": 6, "cantidad": 6 },   // Café (gramos)
    { "insumoId": 7, "cantidad": 1 }    // Leche (gramos)
  ]
}
```

### 6. Producir Café Suave

```
POST /api/movimiento-producto
{
  "fecha": "2024-01-15",
  "descripcion": "Producción diaria",
  "tipoMovimiento": "ENTRADA",
  "detalles": [
    { "productoId": 1, "cantidad": 20, "precio": 0 }
  ]
}
```

**Resultado:**
- Descuenta 1 Botella Armada por cada café (NO toca componentes)
- Descuenta 6g Café por cada café
- Descuenta 1g Leche por cada café

## Cálculo de Costos

### Costo de Insumo Compuesto

Al ensamblar, el sistema calcula:
```
Costo Total = Σ (PrecioUnitario_Componente × Cantidad_Componente)
Precio Unitario = Costo Total / Cantidad Ensamblada
```

Ejemplo:
- Botella: $0.18
- Tapa: $0.05
- Etiqueta Tapa: $0.02
- Etiqueta Botella: $0.05
- **Costo por Botella Armada: $0.30**

### Costo de Producto Final

```
Costo Producto = (1 × $0.30) + (6 × $0.25) + (1 × $0.08) = $1.88
```

Donde:
- $0.30 = precio de Botella Armada
- $0.25 = precio por gramo de café
- $0.08 = precio por gramo de leche

## Validaciones Implementadas

1. **Crear Insumo Compuesto:**
   - Nombre único
   - Unidad de medida obligatoria
   - Al menos un componente
   - Solo insumos BASE en la receta
   - Cantidades > 0

2. **Ensamblar:**
   - Cantidad > 0
   - Fecha obligatoria
   - Stock suficiente de todos los componentes
   - Solo insumos tipo COMPUESTO

3. **Movimientos:**
   - No permite usar insumos COMPUESTOS editados si fueron consumidos
   - Mantiene integridad referencial

## Logs de Depuración

El sistema incluye logs detallados en:
- Backend: `System.out.println` en servicio y controlador
- Frontend: `console.log` en acciones Redux y modales

## Tipos de Datos

### Backend
- Usa `double` para precios y cantidades (NO BigDecimal)
- Usa `int` para IDs y contadores
- Usa `LocalDate` para fechas

### Frontend
- Usa `parseFloat()` para convertir cantidades
- Usa `parseInt()` para IDs
- Formato de fecha: `YYYY-MM-DD`

## Estilo y UX

- Modales consistentes con el resto del sistema
- Validaciones en tiempo real
- Mensajes de error claros
- Indicadores de carga (LoadingSpinner)
- Badges visuales para distinguir tipos
- Muestra consumo estimado antes de ensamblar
- Prevención de duplicados en recetas

## Compatibilidad con Sistema Existente

- No afecta insumos BASE existentes
- Compatible con productos que usan insumos BASE
- Los productos pueden mezclar insumos BASE y COMPUESTOS
- Movimientos de insumos funcionan igual para ambos tipos

## Testing Recomendado

1. Crear insumos base
2. Cargar stock de insumos base
3. Crear insumo compuesto
4. Ensamblar insumo compuesto (validar stock descontado)
5. Crear producto con insumo compuesto
6. Producir producto (validar consumo correcto)
7. Verificar cálculo de costos
8. Intentar ensamblar sin stock (validar error)
9. Verificar que no se puede editar movimientos usados

## Próximos Pasos (Opcionales)

1. Agregar edición de recetas de insumos compuestos
2. Agregar eliminación de insumos compuestos (con validaciones)
3. Reportes de consumo por insumo compuesto
4. Histórico de ensambles
5. Exportar/importar recetas

---

**Implementación completada:** Todos los TODOs finalizados exitosamente.


# Ejemplos de API - Insumos Compuestos (Postman)

## 🔐 Autenticación

Todos los endpoints requieren autenticación JWT. Primero obtén el token:

```
POST https://api.lattituc.site/api/auth/login
Content-Type: application/json

{
  "username": "tu_usuario",
  "password": "tu_password"
}
```

Luego agrega el token en Headers:
```
Authorization: Bearer <tu_token>
```

---

## 📦 1. Crear Insumos Base

### Crear Botella
```
POST https://api.lattituc.site/api/insumos
Content-Type: application/json
Authorization: Bearer <token>

{
  "nombre": "Botella",
  "unidadMedida": "UNIDADES"
}
```

### Crear Tapa
```
POST https://api.lattituc.site/api/insumos
Content-Type: application/json
Authorization: Bearer <token>

{
  "nombre": "Tapa",
  "unidadMedida": "UNIDADES"
}
```

### Crear Etiqueta Tapa
```
POST https://api.lattituc.site/api/insumos
Content-Type: application/json
Authorization: Bearer <token>

{
  "nombre": "Etiqueta Tapa",
  "unidadMedida": "UNIDADES"
}
```

### Crear Etiqueta Botella
```
POST https://api.lattituc.site/api/insumos
Content-Type: application/json
Authorization: Bearer <token>

{
  "nombre": "Etiqueta Botella",
  "unidadMedida": "UNIDADES"
}
```

---

## 📥 2. Cargar Stock de Insumos Base

```
POST https://api.lattituc.site/api/movimiento-insumo
Content-Type: application/json
Authorization: Bearer <token>

{
  "fecha": "2024-01-15",
  "descripcion": "Compra inicial de insumos",
  "tipoMovimiento": "ENTRADA",
  "detalles": [
    {
      "insumoId": 1,
      "cantidad": 100,
      "precio": 18
    },
    {
      "insumoId": 2,
      "cantidad": 100,
      "precio": 5
    },
    {
      "insumoId": 3,
      "cantidad": 100,
      "precio": 2
    },
    {
      "insumoId": 4,
      "cantidad": 100,
      "precio": 5
    }
  ]
}
```

**Notas:**
- `insumoId`: Usar los IDs reales de tus insumos base
- `precio`: Precio TOTAL (no unitario)

---

## 🔧 3. Crear Insumo Compuesto "Botella Armada"

```
POST https://api.lattituc.site/api/insumo-compuesto
Content-Type: application/json
Authorization: Bearer <token>

{
  "nombre": "Botella Armada",
  "unidadMedida": "UNIDADES",
  "receta": [
    {
      "insumoBaseId": 1,
      "cantidad": 1
    },
    {
      "insumoBaseId": 2,
      "cantidad": 1
    },
    {
      "insumoBaseId": 3,
      "cantidad": 1
    },
    {
      "insumoBaseId": 4,
      "cantidad": 1
    }
  ]
}
```

**Notas:**
- `insumoBaseId`: IDs de los insumos base
- `cantidad`: Cantidad de cada componente por unidad de compuesto
- Solo insumos de `tipo: "BASE"` pueden ser componentes

**Respuesta esperada:**
```json
{
  "id": 5,
  "nombre": "Botella Armada",
  "unidadMedida": "UNIDADES",
  "tipo": "COMPUESTO",
  "stockActual": 0,
  "precioDeCompra": 0,
  "receta": [
    {
      "id": 1,
      "insumoBaseId": 1,
      "nombreInsumoBase": "Botella",
      "cantidad": 1,
      "unidadMedida": "UNIDADES"
    },
    {
      "id": 2,
      "insumoBaseId": 2,
      "nombreInsumoBase": "Tapa",
      "cantidad": 1,
      "unidadMedida": "UNIDADES"
    },
    {
      "id": 3,
      "insumoBaseId": 3,
      "nombreInsumoBase": "Etiqueta Tapa",
      "cantidad": 1,
      "unidadMedida": "UNIDADES"
    },
    {
      "id": 4,
      "insumoBaseId": 4,
      "nombreInsumoBase": "Etiqueta Botella",
      "cantidad": 1,
      "unidadMedida": "UNIDADES"
    }
  ]
}
```

---

## 🏗️ 4. Ensamblar Botella Armada

```
POST https://api.lattituc.site/api/insumo-compuesto/5/ensamblar
Content-Type: application/json
Authorization: Bearer <token>

{
  "cantidad": 50,
  "fecha": "2024-01-15",
  "descripcion": "Juan armó 50 botellas"
}
```

**Notas:**
- Usar el ID real del insumo compuesto (ej: 5)
- `cantidad`: Cuántas unidades ensamblar
- Sistema valida stock suficiente automáticamente

**Respuesta esperada:**
```json
{
  "id": 5,
  "nombre": "Botella Armada",
  "unidadMedida": "UNIDADES",
  "tipo": "COMPUESTO",
  "stockActual": 50,
  "precioDeCompra": 0.30,
  "receta": [...]
}
```

**Lo que sucede internamente:**
1. Descuenta 50 unidades de cada componente (SALIDA)
2. Suma 50 unidades de "Botella Armada" (ENTRADA)
3. Calcula precio: (0.18 + 0.05 + 0.02 + 0.05) = $0.30/u

---

## 📋 5. Listar Insumos Compuestos

```
GET https://api.lattituc.site/api/insumo-compuesto
Authorization: Bearer <token>
```

**Respuesta esperada:**
```json
[
  {
    "id": 5,
    "nombre": "Botella Armada",
    "unidadMedida": "UNIDADES",
    "tipo": "COMPUESTO",
    "stockActual": 50,
    "precioDeCompra": 0.30,
    "receta": [...]
  }
]
```

---

## 🔍 6. Obtener Insumo Compuesto por ID

```
GET https://api.lattituc.site/api/insumo-compuesto/5
Authorization: Bearer <token>
```

---

## ☕ 7. Crear Producto que Usa Insumo Compuesto

```
POST https://api.lattituc.site/api/productos
Content-Type: application/json
Authorization: Bearer <token>

{
  "nombre": "Café Suave",
  "insumos": [
    {
      "insumoId": 5,
      "cantidad": 1
    },
    {
      "insumoId": 6,
      "cantidad": 6
    },
    {
      "insumoId": 7,
      "cantidad": 1
    }
  ]
}
```

**Notas:**
- `insumoId: 5`: Botella Armada (COMPUESTO)
- `insumoId: 6`: Café en granos (BASE)
- `insumoId: 7`: Leche en polvo (BASE)

---

## 🏭 8. Producir Café Suave

```
POST https://api.lattituc.site/api/movimiento-producto
Content-Type: application/json
Authorization: Bearer <token>

{
  "fecha": "2024-01-15",
  "descripcion": "Producción diaria",
  "tipoMovimiento": "ENTRADA",
  "detalles": [
    {
      "productoId": 1,
      "cantidad": 20,
      "precio": 0
    }
  ]
}
```

**Lo que sucede:**
- Descuenta 20 Botellas Armadas (NO toca componentes)
- Descuenta 120g Café (6g × 20)
- Descuenta 20g Leche (1g × 20)
- Suma 20 unidades de Café Suave
- Calcula costo: $1.88/u

---

## 🧪 Pruebas de Validación

### ❌ Ensamblar sin stock suficiente
```
POST https://api.lattituc.site/api/insumo-compuesto/5/ensamblar
Content-Type: application/json
Authorization: Bearer <token>

{
  "cantidad": 1000,
  "fecha": "2024-01-15",
  "descripcion": "Intentar ensamblar más de lo disponible"
}
```

**Respuesta esperada:**
```
400 Bad Request
"Stock insuficiente del componente 'Botella'. Stock actual: 50, Cantidad necesaria: 1000"
```

### ❌ Crear compuesto con insumo duplicado
```
POST https://api.lattituc.site/api/insumo-compuesto
Content-Type: application/json
Authorization: Bearer <token>

{
  "nombre": "Compuesto Inválido",
  "unidadMedida": "UNIDADES",
  "receta": [
    {
      "insumoBaseId": 1,
      "cantidad": 1
    },
    {
      "insumoBaseId": 1,
      "cantidad": 2
    }
  ]
}
```

**Respuesta esperada:**
```
400 Bad Request
(El frontend previene esto, pero el backend también valida)
```

---

## 📊 Verificar Movimientos Creados

### Ver movimientos de insumos
```
GET https://api.lattituc.site/api/movimiento-insumo
Authorization: Bearer <token>
```

Buscar en la respuesta:
- Movimientos de SALIDA para componentes (ensamble)
- Movimientos de ENTRADA para Botella Armada (ensamble)

### Ver stock actualizado
```
GET https://api.lattituc.site/api/insumos
Authorization: Bearer <token>
```

Verificar:
- Stock de componentes descontado
- Stock de Botella Armada incrementado
- Precio de Botella Armada calculado

---

## 💡 Tips para Pruebas

1. **Orden recomendado:**
   - Crear insumos base
   - Cargar stock
   - Crear compuesto
   - Ensamblar
   - Crear producto
   - Producir

2. **IDs dinámicos:**
   - Los IDs varían según tu base de datos
   - Guarda los IDs de respuestas para requests siguientes

3. **Fechas:**
   - Usar formato `YYYY-MM-DD` (ISO 8601)
   - Validar fechas coherentes

4. **Logs:**
   - Revisar consola del backend para logs detallados
   - Revisar consola del navegador para logs del frontend

5. **Errores comunes:**
   - Token expirado → Re-loguear
   - IDs incorrectos → Verificar con GET
   - Stock insuficiente → Cargar más stock

---

## 🔄 Colección Postman Completa

### Variables de entorno sugeridas:
```
baseUrl: https://api.lattituc.site/api
token: <tu_token_jwt>
insumoBotellaId: 1
insumoTapaId: 2
insumoEtiqTapaId: 3
insumoEtiqBotellaId: 4
insumoCompuestoId: 5
productoId: 1
```

Usar en requests:
```
{{baseUrl}}/insumo-compuesto
Authorization: Bearer {{token}}
```

---

¡Listo para probar! 🚀


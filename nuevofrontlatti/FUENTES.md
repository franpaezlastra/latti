# Guía de Fuentes Personalizadas - Sistema Latti

## 🎨 Fuentes Disponibles

### 1. **TransformaSans** (Fuente Principal)
- **Uso**: Texto general, párrafos, botones, inputs
- **Clases Tailwind**: `font-sans` (predeterminada)
- **Pesos disponibles**:
  - `font-light` (300)
  - `font-normal` (400)
  - `font-medium` (500)
  - `font-bold` (700)
  - `font-extrabold` (800)
  - `font-black` (900)

### 2. **Maderon** (Fuente de Títulos)
- **Uso**: Títulos principales, logos, elementos destacados
- **Clase Tailwind**: `font-maderon`
- **Pesos**: Regular (400) e Italic (400)

### 3. **TransformaScript** (Fuente Decorativa)
- **Uso**: Elementos decorativos, citas, firmas
- **Clase Tailwind**: `font-transforma`
- **Peso**: Medium (500)

## 📝 Ejemplos de Uso

### Títulos Principales
```jsx
<h1 className="text-3xl font-bold font-maderon text-primary-600">
  Sistema de Gestión
</h1>
```

### Subtítulos
```jsx
<h2 className="text-xl font-semibold font-sans text-gray-800">
  Panel de Control
</h2>
```

### Texto Normal
```jsx
<p className="text-base font-sans text-gray-600">
  Este es el texto normal del sistema.
</p>
```

### Elementos Decorativos
```jsx
<div className="text-lg font-transforma text-primary-500">
  "Latti - Calidad y Confianza"
</div>
```

### Botones
```jsx
<button className="px-4 py-2 bg-primary-500 text-white font-medium rounded-lg">
  Guardar Cambios
</button>
```

### Inputs
```jsx
<input 
  className="w-full px-3 py-2 border border-gray-300 rounded-lg font-sans"
  placeholder="Ingrese su texto"
/>
```

## 🎯 Configuración Automática

Las fuentes se aplican automáticamente a:

- **Todos los elementos**: `font-sans` (TransformaSans)
- **Títulos (h1-h6)**: `font-sans` con `font-weight: 700`
- **Botones**: `font-sans`
- **Inputs**: `font-sans`
- **Badges**: `font-sans`

## 🚀 Clases CSS Personalizadas

### Para títulos especiales
```css
.title-maderon {
  font-family: 'Maderon', sans-serif;
}
```

### Para elementos decorativos
```css
.decorative {
  font-family: 'TransformaScript', sans-serif;
}
```

## 📱 Responsive Design

Las fuentes se adaptan automáticamente a diferentes tamaños de pantalla:

```jsx
<h1 className="text-2xl md:text-3xl lg:text-4xl font-bold font-maderon">
  Título Responsive
</h1>
```

## 🎨 Paleta de Colores

- **Texto principal**: `#101010`
- **Texto secundario**: `#6B7280`
- **Enlaces**: `#2563EB`
- **Fondo**: `#F6F2EC`

## 📋 Checklist de Implementación

- [x] Fuentes cargadas en `fonts.css`
- [x] Configuración en `tailwind.config.js`
- [x] Estilos globales en `globals.css`
- [x] Aplicación automática a todos los elementos
- [x] Clases específicas para fuentes especiales
- [x] Documentación completa

## 🔧 Troubleshooting

### Si las fuentes no se cargan:
1. Verificar que `fonts.css` esté importado en `globals.css`
2. Verificar que los archivos `.woff2` estén en la carpeta `assets/fonts/`
3. Revisar la consola del navegador para errores de carga

### Si las fuentes no se aplican:
1. Verificar que `globals.css` esté importado en `main.jsx`
2. Verificar que no haya estilos CSS que sobrescriban las fuentes
3. Usar las clases específicas: `font-maderon`, `font-transforma` 
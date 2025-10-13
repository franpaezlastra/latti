// Script de depuración para verificar la carga de insumos
// Ejecutar en la consola del navegador

console.log('🔍 Depuración de insumos...');

// Verificar estado de Redux
const state = window.__REDUX_DEVTOOLS_EXTENSION__ ? 
  window.__REDUX_DEVTOOLS_EXTENSION__.getState() : 
  null;

if (state) {
  console.log('📊 Estado de Redux:', state);
  console.log('📦 Insumos en el store:', state.insumos);
} else {
  console.log('❌ Redux DevTools no disponible');
}

// Verificar localStorage
console.log('💾 Token en localStorage:', localStorage.getItem('token'));
console.log('👤 Usuario en localStorage:', localStorage.getItem('user'));

// Función para probar la carga de insumos
async function probarCargaInsumos() {
  try {
    const token = localStorage.getItem('token');
    console.log('🔄 Probando carga de insumos...');
    
    const response = await fetch('https://api.lattituc.site/api/insumos', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📡 Respuesta del servidor:', response.status, response.statusText);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Insumos cargados:', data);
      console.log('📊 Cantidad de insumos:', data.length);
    } else {
      console.log('❌ Error al cargar insumos:', response.status);
      const errorText = await response.text();
      console.log('📄 Error details:', errorText);
    }
  } catch (error) {
    console.log('💥 Error de conexión:', error);
  }
}

// Ejecutar la prueba
probarCargaInsumos();

console.log('✅ Script de depuración ejecutado');

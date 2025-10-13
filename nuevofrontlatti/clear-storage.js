// Script para limpiar el localStorage y solucionar problemas de autenticación
// Ejecutar en la consola del navegador

console.log('🧹 Limpiando localStorage...');

// Limpiar datos de autenticación
localStorage.removeItem('user');
localStorage.removeItem('token');

// Limpiar otros datos que puedan estar corruptos
const keysToRemove = [];
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  if (key && (key.includes('undefined') || key.includes('null'))) {
    keysToRemove.push(key);
  }
}

keysToRemove.forEach(key => {
  localStorage.removeItem(key);
  console.log(`🗑️ Removido: ${key}`);
});

console.log('✅ localStorage limpiado correctamente');
console.log('🔄 Por favor, recarga la página e inicia sesión nuevamente');
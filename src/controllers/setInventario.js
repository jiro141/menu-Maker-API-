const cron = require('node-cron');
const db = require('../conexionDB');

// Función para actualizar la cantidad a cero en el inventario
function resetInventario() {
  const updateQuery = 'UPDATE inventario SET cantidad = 0';

  db.run(updateQuery, [], function(err) {
    if (err) {
      console.error('Error al restablecer la cantidad en el inventario:', err);
    } else {
      console.log('Cantidad en el inventario restablecida a cero correctamente');
    }
  });
}

// Ejecutar la función a las 10:00 AM cada día
// cron.schedule('0 10 * * *', () => {
//   resetInventario();
// }, {
//   timezone: 'America/Caracas' // Zona horaria de Venezuela
// });

module.exports = resetInventario;

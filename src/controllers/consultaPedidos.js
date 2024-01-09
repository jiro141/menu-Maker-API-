const db = require("../conexionDB");

// Función para consultar un platillo por su ID
async function consultaPedidos(id) {
  return new Promise((resolve, reject) => {
    const selectQuery = "SELECT * FROM pedidos WHERE id = ?";
    db.get(selectQuery, [id], (err, row) => {
      if (err) {
        reject(err); // En caso de error en la consulta, rechaza la promesa
      } else {
        if (row) {
          // Si se encontró el platillo con el ID proporcionado, resuelve la promesa con los detalles
          resolve(row);
        } else {
          // Si no se encuentra el platillo, rechaza la promesa con un mensaje indicando que no existe
          resolve(null);
        }
      }
    });
  });
}

module.exports = { consultaPedidos };

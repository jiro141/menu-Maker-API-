const db = require("../conexionDB");

// Función para consultar un platillo por su ID
async function consulta(id) {
  console.log(id, ' datos');
  if (Array.isArray(id)) {
    let promises = [];

    for (let index = 0; index < id.length; index++) {
      const indexId = id[index];
      const selectQuery = "SELECT * FROM inventario WHERE id = ?";
      let promise = new Promise((resolve, reject) => {
        db.get(selectQuery, [indexId], (err, row) => {
          if (err) {
            reject(err);
          } else {
            if (row) {
              resolve(row);
            } else {
              resolve(null);
            }
          }
        });
      });
      promises.push(promise);
    }
    console.log(promises,' promesas');
    return Promise.all(promises)
      .then((results) => {
        return results;
         // Filtrar resultados nulos
      })
      .catch((error) => {
        console.error(error);
        throw error; // Relanza el error para ser manejado por el código que llama a esta función
      });
      
  } else {
    return new Promise((resolve, reject) => {
      const selectQuery = "SELECT * FROM inventario WHERE id = ?";
      db.get(selectQuery, [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          if (row) {
            resolve(row);
          } else {
            resolve(null);
          }
        }
      });
    });
  }
}

module.exports = { consulta };

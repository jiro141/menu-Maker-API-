const db = require("../conexionDB");

// Función para consultar un platillo por su ID
async function consultarPlatillos(id) {
  if (Array.isArray(id)) {
    let promises = [];

    for (let index = 0; index < id.length; index++) {
      const currentArray = id[index];
      let subResults = [];

      for (let subIndex = 0; subIndex < currentArray.length; subIndex++) {
        const indexId = currentArray[subIndex];
        const selectQuery = "SELECT * FROM inventario WHERE id = ?";
        let promise = new Promise((resolve, reject) => {
          db.get(selectQuery, [indexId], (err, row) => {
            if (err) {
              reject(err);
            } else {
              if (row) {
                subResults.push(row); // Almacena el resultado en el subarreglo correspondiente
                resolve(row);
              } else {
                subResults.push(null); // Almacena null si no se encontró resultado
                resolve(null);
              }
            }
          });
        });
        promises.push(promise);
      }

      promises.push(subResults); // Agrega el subarreglo de resultados al arreglo de promesas
    }

    // console.log(promises, " promesas");

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

module.exports = { consultarPlatillos };

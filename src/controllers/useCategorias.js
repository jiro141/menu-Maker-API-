const db = require("../conexionDB");

// Función para consultar categorías por sus IDs
async function useCategorias(ids) {
  console.log(ids, "IDs en el controlador");

  if (Array.isArray(ids) && ids.length > 0) {
    const promises = [];
    for (let index = 0; index < ids.length; index++) {
      const currentId = ids[index];
      const selectQuery = "SELECT * FROM categorias WHERE id = ?";

      const promise = new Promise((resolve, reject) => {
        db.get(selectQuery, [currentId], (err, row) => {
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

    return Promise.all(promises)
      .then((results) => results.filter((result) => result !== null))
      .catch((error) => {
        console.error(error);
        throw error;
      });
  } else {
    return Promise.resolve([]);
  }
}

module.exports = { useCategorias };

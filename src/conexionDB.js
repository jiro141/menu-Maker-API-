// En el archivo conexionDB.js
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./dbMenu', sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Conexión exitosa a la base de datos SQLite');
  }
});

module.exports = db;

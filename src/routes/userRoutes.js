const express = require("express");
const User = require("../models/User");
const UserController = require("../controllers/userControllers");
const bcrypt = require('bcrypt');

const db = require("../conexionDB"); 
const router = express.Router();

router.post("/register", async (req, res) => {
  const { userName, password, userGroup } = req.body;

  // Verificar si ya existe un usuario con el mismo userName
  const checkQuery = "SELECT * FROM users WHERE userName = ?";
  db.get(checkQuery, [userName], async (err, row) => {
    if (err) {
      console.error("Error al verificar usuario:", err);
      res.status(500).send("Error al verificar usuario");
    } else if (row) {
      //  un usuario con el mismo userName
      res.status(400).send("El nombre de usuario ya está en uso");
    } else {
      // Encriptar la contraseña 
      const hashedPassword = await bcrypt.hash(password, 10);

      const insertQuery = "INSERT INTO users (userName, password, userGroup) VALUES (?, ?, ?)";
      const values = [userName, hashedPassword, userGroup];

      // Insertar el nuevo usuario en la base de datos
      db.run(insertQuery, values, function (err) {
        if (err) {
          console.error("Error al registrar usuario:", err);
          res.status(500).send("Error al registrar usuario");
        } else {
          console.log(`Usuario ${userName} registrado correctamente`);
          res.status(200).send("Usuario registrado correctamente");
        }
      });
    }
  });
});

module.exports = router;

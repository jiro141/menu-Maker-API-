const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../conexionDB");
require('dotenv').config();

const router = express.Router();

router.post("/login", async (req, res) => {
  const { userName, password } = req.body;

  // Consulta para obtener el usuario y el nombre del grupo asociado
  const query = `
    SELECT users.*, userGroup.groupName
    FROM users
    INNER JOIN userGroup ON users.userGroup = userGroup.id
    WHERE users.userName = ?
  `;

  db.get(query, [userName], async (err, user) => {
    if (err) {
      console.error("Error al buscar usuario:", err);
      res.status(500).send("Error al buscar el usuario");
    } else if (!user) {
      // Si el usuario no existe
      res.status(401).send("Credenciales inválidas");
    } else {
      // Verificar la contraseña
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        // Si la contraseña es incorrecta
        res.status(401).send("Credenciales inválidas");
      } else {
        // Generar un token JWT con una expiración de 4 horas (en segundos)
        const secretKey = process.env.SECRET_KEY; // Clave secreta para firmar el token

        const token = jwt.sign(
          { userId: user.id, groupName: user.groupName }, 
          secretKey, 
          { expiresIn: "4h" }
        );

        // Devolver el token y el nombre del grupo al usuario
        res.status(200).json({ token, groupName: user.groupName });
      }
    }
  });
});

module.exports = router;

const express = require("express");
const db = require("../../../conexionDB");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const router = express.Router();

// Middleware para verificar el token
function verificarToken(req, res, next) {
  const secretKey = process.env.SECRET_KEY;
  const token = req.headers["authorization"];

  if (!token) {
    return res
      .status(401)
      .json({ message: "Token no proporcionado. Acceso denegado." });
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res
        .status(403)
        .json({ message: "Token inválido. Acceso denegado." });
    }
    req.user = decoded;
    next();
  });
}

// Obtener todos los platillos
router.get("/platillos", verificarToken, (req, res) => {
  const selectAllQuery = "SELECT * FROM platillos";

  db.all(selectAllQuery, (err, rows) => {
    if (err) {
      console.error("Error al obtener los platillos:", err);
      res.status(500).send("Error al obtener los platillos");
    } else {
      res.status(200).json(rows);
    }
  });
});

// Obtener detalle de un platillo por su ID
router.get("/platillos/:id", verificarToken, (req, res) => {
  const platilloId = req.params.id;
  const selectPlatilloQuery = "SELECT * FROM platillos WHERE id = ?";

  db.get(selectPlatilloQuery, [platilloId], (err, row) => {
    if (err) {
      console.error(`Error al obtener el platillo con ID ${platilloId}:`, err);
      res.status(500).send(`Error al obtener el platillo con ID ${platilloId}`);
    } else if (!row) {
      res.status(404).send(`Platillo con ID ${platilloId} no encontrado`);
    } else {
      res.status(200).json(row);
    }
  });
});

module.exports = router;

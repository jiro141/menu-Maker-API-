const express = require("express");
const db = require("../../conexionDB");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const router = express.Router();

// Verificar el token
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

// Endpoint para insertar valores en la tabla de inventario
router.post("/crearInventario", verificarToken, async (req, res) => {
  const { cantidad, platillo } = req.body;

  if (!cantidad || !platillo) {
    return res.status(400).json({ message: "Faltan campos obligatorios." });
  }

  const selectQuery = "SELECT COUNT(*) as count FROM inventario WHERE platillo = ?";

  db.get(selectQuery, [platillo], (err, row) => {
    if (err) {
      console.error("Error al verificar el platillo en el inventario:", err);
      return res.status(500).json({ message: "Error interno del servidor." });
    }

    if (row.count > 0) {
      return res.status(400).json({ message: "Ya existe un registro de inventario para este platillo." });
    }

    const insertQuery = "INSERT INTO inventario (cantidad, platillo) VALUES (?, ?)";

    db.run(insertQuery, [cantidad, platillo], function (err) {
      if (err) {
        console.error("Error al insertar en inventario:", err);
        return res.status(500).json({ message: "Error al insertar en inventario." });
      }

      console.log("Valores insertados en inventario correctamente");
      res.status(201).json({
        message: "Valores insertados en inventario correctamente",
        inventario_id: this.lastID
      });
    });
  });
});

module.exports = router;

const express = require("express");
const db = require("../../conexionDB");
const jwt = require("jsonwebtoken");
const { consulta } = require("../../controllers/consultaInventario");
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
// Endpoint para crear una nueva orden
router.post("/crearOrden", verificarToken, async (req, res) => {
  const { pedido } = req.body;
  const estado = 1;
  if (!pedido || !estado) {
    return res.status(400).json({ message: "Faltan campos obligatorios." });
  }

  try {
    const insertQuery = "INSERT INTO ordenes (pedido, estado) VALUES (?, ?)";
    db.run(insertQuery, [pedido, estado], function (err) {
      if (err) {
        console.error("Error al insertar la orden:", err);
        return res.status(500).json({ message: "Error al insertar la orden." });
      }

      console.log("Orden creada correctamente");
      res.status(201).json({
        message: "Orden creada correctamente",
        id: this.lastID,
        pedido: pedido,
        estado: estado,
      });
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

module.exports = router;

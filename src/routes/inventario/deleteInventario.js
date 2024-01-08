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

// Endpoint para eliminar un registro de inventario por ID
router.delete("/eliminarInventario/:id", verificarToken, async (req, res) => {
  const inventarioId = req.params.id;

  const deleteQuery = "DELETE FROM inventario WHERE id = ?";

  db.run(deleteQuery, [inventarioId], function (err) {
    if (err) {
      console.error(`Error al eliminar el inventario con ID ${inventarioId}:`, err);
      return res.status(500).json({ message: "Error al eliminar el inventario." });
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: "No se encontró el registro de inventario." });
    }

    console.log(`Inventario con ID ${inventarioId} eliminado correctamente`);
    res.status(200).json({
      message: `Inventario con ID ${inventarioId} eliminado correctamente`,
      inventario_id: inventarioId
    });
  });
});

module.exports = router;

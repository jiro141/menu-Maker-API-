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

// Endpoint para eliminar un platillo por su ID
router.delete("/deletePlatillo/:id", verificarToken, async (req, res) => {
  const platilloId = req.params.id;

  const deleteQuery = "DELETE FROM platillos WHERE id = ?";
  db.run(deleteQuery, [platilloId], function (err) {
    if (err) {
      console.error(`Error al eliminar platillo con ID ${platilloId}:`, err);
      return res.status(500).send(`Error al eliminar platillo con ID ${platilloId}`);
    }

    if (this.changes === 0) {
      return res.status(404).send(`Platillo con ID ${platilloId} no encontrado`);
    }

    console.log(`Platillo con ID ${platilloId} eliminado correctamente`);
    res.status(200).send(`Platillo con ID ${platilloId} eliminado correctamente`);
  });
});

module.exports = router;

const express = require("express");
const db = require("../../conexionDB");
const jwt = require("jsonwebtoken");
const pdfGenerator = require("../../models/pdfGenerator");
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

// Endpoint para eliminar un menú por su ID
router.delete("/deleteMenu/:id", verificarToken, async (req, res) => {
  const menuId = req.params.id;

  const deleteQuery = "DELETE FROM menu WHERE id = ?";
  db.run(deleteQuery, [menuId], function (err) {
    if (err) {
      console.error(`Error al eliminar menú con ID ${menuId}:`, err);
      return res.status(500).send(`Error al eliminar menú con ID ${menuId}`);
    }

    if (this.changes === 0) {
      return res.status(404).send(`Menú con ID ${menuId} no encontrado`);
    }

    console.log(`Menú con ID ${menuId} eliminado correctamente`);
    res.status(200).send(`Menú con ID ${menuId} eliminado correctamente`);
  });
});

module.exports = router;

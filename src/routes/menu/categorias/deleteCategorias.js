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

// Endpoint para eliminar una categoría por su ID
router.delete("/deleteCategoria/:id", verificarToken, async (req, res) => {
  const categoriaId = req.params.id;

  const deleteQuery = "DELETE FROM categorias WHERE id = ?";
  db.run(deleteQuery, [categoriaId], function (err) {
    if (err) {
      console.error(`Error al eliminar categoría con ID ${categoriaId}:`, err);
      return res.status(500).send(`Error al eliminar categoría con ID ${categoriaId}`);
    }

    if (this.changes === 0) {
      return res.status(404).send(`Categoría con ID ${categoriaId} no encontrada`);
    }

    console.log(`Categoría con ID ${categoriaId} eliminada correctamente`);
    res.status(200).send(`Categoría con ID ${categoriaId} eliminada correctamente`);
  });
});

module.exports = router;

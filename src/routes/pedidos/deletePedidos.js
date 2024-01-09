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
// Endpoint para eliminar un pedido por su ID
router.delete("/eliminarPedido/:id", verificarToken, async (req, res) => {
  const pedidoId = req.params.id;

  try {
    const deleteQuery = "DELETE FROM pedidos WHERE id = ?";
    db.run(deleteQuery, [pedidoId], function (err) {
      if (err) {
        console.error("Error al eliminar el pedido:", err);
        return res
          .status(500)
          .json({ message: "Error al eliminar el pedido." });
      }

      if (this.changes === 0) {
        return res.status(404).json({ message: "Pedido no encontrado." });
      }

      console.log("Pedido eliminado correctamente");
      res.status(200).json({ message: "Pedido eliminado correctamente" });
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});
module.exports = router;

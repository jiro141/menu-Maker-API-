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
// Endpoint para actualizar un pedido existente
// Endpoint para actualizar varios platillos en un pedido existente
// Método PUT para actualizar un pedido existente
router.put("/actualizarPedido/:idPedido", verificarToken, async (req, res) => {
  const { idPedido } = req.params;
  const { detalles } = req.body;

  if (!detalles || detalles.length === 0) {
    return res
      .status(400)
      .json({ message: "No se proporcionaron detalles para actualizar." });
  }

  try {
    // Verificar si el pedido existe
    const selectPedidoQuery = "SELECT * FROM pedidos WHERE id = ?";
    const pedido = await db.get(selectPedidoQuery, [idPedido]);

    if (!pedido) {
      return res.status(404).json({ message: "El pedido no existe." });
    }

    // Actualizar cada detalle del pedido
    for (const detalle of detalles) {
      const { platillo, nuevaCantidad } = detalle;

      // Verificar si el platillo existe en el pedido y actualizar la cantidad
      const updateDetalleQuery =
        "UPDATE pedidos SET cantidad = ? WHERE id = ? AND platillos = ?";
      await db.run(updateDetalleQuery, [nuevaCantidad, idPedido, platillo]);
    }

    console.log("Pedido actualizado correctamente");
    res
      .status(200)
      .json({ message: "Pedido actualizado correctamente", idPedido });
  } catch (error) {
    console.error("Error al actualizar el pedido:", error);
    return res.status(500).json({ message: "Error al actualizar el pedido." });
  }
});

module.exports = router;

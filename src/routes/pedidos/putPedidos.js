const express = require("express");
const db = require("../../conexionDB");
const jwt = require("jsonwebtoken");
const { consultaPedidos } = require("../../controllers/consultaPedidos");
const { consulta } = require("../../controllers/consultaInventario");
const { actualizarDetallesDB } = require("../../controllers/actualizarPedidos");
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
  let { idPedido } = req.params;
  const { detalles } = req.body;
  idPedido = parseInt(idPedido);
  console.log(idPedido);
  if (!detalles || detalles.length === 0) {
    return res
      .status(400)
      .json({ message: "No se proporcionaron detalles para actualizar." });
  }

  try {
    const respuesta = await consultaPedidos(idPedido);
    if (!respuesta) {
      return res.status(404).json({ message: "El pedido no existe." });
    }
    const updatedDetails = [];
    for (let i = 0; i < detalles.length; i++) {
      const { platillo, nuevaCantidad } = detalles[i];
      // const inventarioValue = platillo;

      const response = await consulta(detalles[i].inventario);
      console.log(response, " datos2");
      if (
        !response ||
        response.length === 0 ||
        response.cantidad < nuevaCantidad
      ) {
        return res.status(404).json({
          message: `La cantidad disponible del platillo ${platillo} es menor a la cantidad solicitada o no disponible en el inventario`,
        });
      }

      await actualizarDetallesDB(idPedido, detalles);
      updatedDetails.push({ platillo, nuevaCantidad });
    }

    res.status(200).json({
      message: "Pedidos actualizados correctamente",
      idPedido,
      updatedDetails,
    });
  } catch (error) {
    console.error("Error al actualizar el pedido:", error);
    return res.status(500).json({ message: "Error al actualizar el pedido." });
  }
});

module.exports = router;

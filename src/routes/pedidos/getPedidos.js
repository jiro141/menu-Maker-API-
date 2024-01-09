// Endpoint para obtener la lista de pedidos
const express = require("express");
const db = require("../../conexionDB");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const router = express.Router();
const { consultarPlatillos } = require("../../controllers/consultarPlatillos");
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
router.get("/Pedidos", verificarToken, async (req, res) => {
  try {
    const selectQuery = "SELECT * FROM pedidos";

    db.all(selectQuery, [], async (err, rows) => {
      if (err) {
        console.error("Error al obtener la lista de pedidos:", err);
        return res
          .status(500)
          .json({ message: "Error al obtener la lista de pedidos." });
      }

      if (!rows || rows.length === 0) {
        return res.status(404).json({ message: "No se encontraron pedidos." });
      }

      const platillos = rows.map((platillo) => platillo.platillos);
      console.log(platillos.length);
      for (let index = 0; index < platillos.length; index++) {
        const element = platillos[index];
        const platillosIndividuales = element.map((platillo) =>
        platillo.split(",").map(Number)
        console.log();
      );
        
      }

      console.log(
        "Lista de pedidos obtenida correctamente",
        platillosIndividuales
      );

      try {
        const response = await consultarPlatillos(platillosIndividuales);
        console.log(response.length, "respuesta");
        for (let index = 0; index < response.length; index++) {
          const element = response[index];
          console.log(element, 'prueba');
        }
        const pedidosConPlatillos = [];

        for (let i = 0; i < rows.length; i++) {
          const pedido = rows[i];
          const pedidoConPlatillos = [];

          if (Array.isArray(response[i])) {
            for (let j = 0; j < response[i].length; j++) {
              pedidoConPlatillos.push(response[i][j]);
            }
          } else {
            pedidoConPlatillos.push(response[i]);
          }

          pedidosConPlatillos.push({
            id: pedido.id,
            estado: pedido.estado,
            cantidad: pedido.cantidad,
            platillos: pedidoConPlatillos,
          });
        }

        res.status(200).json({ pedidos: pedidosConPlatillos });
      } catch (error) {
        return res.status(400).json({ message: error.message });
      }
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

// Endpoint para obtener detalles de un pedido por su ID
router.get("/Pedidos/:id", verificarToken, async (req, res) => {
  const pedidoId = req.params.id;

  try {
    const selectQuery = "SELECT * FROM pedidos WHERE id = ?";
    db.get(selectQuery, [pedidoId], (err, row) => {
      if (err) {
        console.error("Error al obtener los detalles del pedido:", err);
        return res
          .status(500)
          .json({ message: "Error al obtener los detalles del pedido." });
      }

      if (!row) {
        return res.status(404).json({ message: "Pedido no encontrado." });
      }

      console.log("Detalles del pedido obtenidos correctamente");
      res.status(200).json({ pedido: row });
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

module.exports = router;

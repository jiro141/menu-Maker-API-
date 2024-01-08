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

// Endpoint para crear un nuevo pedido
// Endpoint para crear un nuevo pedido
router.post("/crearPedido", verificarToken, async (req, res) => {
  const { estado, detalles } = req.body;

  if (!estado || !detalles || detalles.length === 0) {
    return res.status(400).json({ message: "Faltan campos obligatorios." });
  }

  // Variable para almacenar los IDs de platillos y sus cantidades
  const platillos = [];
  const cantidades = [];

  // Verificar cada detalle del pedido
  for (const detalle of detalles) {
    const { platillo, cantidad, inventario } = detalle;

    // Verificar si el platillo existe en el inventario
    try {
      const selectQuery = "SELECT * FROM inventario WHERE id = ?";
      const row = await db.get(selectQuery, [inventario]);

      if (!row) {
        return res
          .status(404)
          .json({ message: "El platillo no existe en el inventario." });
      }

      // Resto de tu lógica para verificar cantidad, actualizar inventario, etc.
    } catch (error) {
      console.error("Error al consultar la base de datos:", error);
      return res
        .status(500)
        .json({ message: "Error al consultar la base de datos." });
    }

    platillos.push(platillo);
    cantidades.push(cantidad);

    // Actualizar la cantidad en el inventario
    const updateQuery =
      "UPDATE inventario SET cantidad = cantidad - ? WHERE id = ?";
    await db.run(updateQuery, [cantidad, inventario]);
  }

  // Insertar el nuevo pedido
  const insertQuery =
    "INSERT INTO pedidos (estado, platillos, cantidad) VALUES (?, ?, ?)";
  db.run(
    insertQuery,
    [estado, platillos.join(","), cantidades.join(",")],
    function (err) {
      if (err) {
        console.error("Error al insertar el pedido:", err);
        return res
          .status(500)
          .json({ message: "Error al insertar el pedido." });
      }

      console.log("Pedido creado correctamente");
      res.status(201).json({
        message: "Pedido creado correctamente",
        id: this.lastID,
        platillos: platillos,
      });
    }
  );
});

module.exports = router;

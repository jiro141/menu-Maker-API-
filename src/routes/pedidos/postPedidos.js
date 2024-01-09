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

// Endpoint para crear un nuevo pedido
// Endpoint para crear un nuevo pedido
router.post("/crearPedido", verificarToken, async (req, res) => {
  const { estado, detalles } = req.body;

  if (!estado || !detalles || detalles.length === 0) {
    return res.status(400).json({ message: "Faltan campos obligatorios." });
  }

  try {
    const resultadosConsultas = await Promise.all(
      detalles.map(async (detalle) => {
        const { platillo, cantidad, inventario } = detalle;

        try {
          const respuesta = await consulta(inventario);

          if (!respuesta) {
            throw new Error("El platillo no existe en el inventario.");
          }

          if (respuesta.cantidad < cantidad) {
            throw new Error(
              `La cantidad disponible del platillo '${platillo}' es menor a la cantidad solicitada.`
            );
          }

          const updateQuery =
            "UPDATE inventario SET cantidad = cantidad - ? WHERE id = ?";
          await db.run(updateQuery, [cantidad, inventario]);

          return { platillo, cantidad };
        } catch (error) {
          console.error("Error al verificar el platillo:", error);
          throw error; // Propaga el error para manejarlo más abajo
        }
      })
    );

    // Si todo salió bien hasta este punto, proceder con la inserción del pedido
    const platillos = resultadosConsultas.map(
      (resultado) => resultado.platillo
    );
    const cantidades = resultadosConsultas.map(
      (resultado) => resultado.cantidad
    );

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
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

module.exports = router;

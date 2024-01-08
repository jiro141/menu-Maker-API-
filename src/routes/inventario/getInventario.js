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

// Endpoint para obtener la lista de inventario con detalles de platillo asociado
router.get("/inventario", verificarToken, async (req, res) => {
  const selectQuery = "SELECT * FROM inventario";

  db.all(selectQuery, [], (err, rows) => {
    if (err) {
      console.error("Error al obtener el inventario:", err);
      return res.status(500).json({ message: "Error al obtener el inventario." });
    }

    if (rows.length === 0) {
      return res.status(404).json({ message: "No se encontró inventario." });
    }

    const inventario = rows;
    const platilloIds = rows.map(row => row.platillo);
    const selectPlatillosQuery = `SELECT id, nombre, foto FROM platillos WHERE id IN (${platilloIds.join(",")})`;

    db.all(selectPlatillosQuery, [], (err, platillos) => {
      if (err) {
        console.error("Error al obtener los detalles del platillo:", err);
        return res.status(500).json({ message: "Error al obtener los detalles del platillo." });
      }

      const inventarioConPlatillos = inventario.map(item => {
        const platillo = platillos.find(p => p.id === item.platillo);
        return {
          id: item.id,
          cantidad: item.cantidad,
          platillo: {
            id: platillo.id,
            nombre: platillo.nombre,
            foto: platillo.foto
          }
        };
      });

      console.log("Lista de inventario con detalles de platillo obtenida correctamente");
      res.status(200).json({
        message: "Lista de inventario con detalles de platillo obtenida correctamente",
        inventario: inventarioConPlatillos
      });
    });
  });
});

module.exports = router;

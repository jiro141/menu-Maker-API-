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

// Obtener todas las categorías
router.get("/categorias", verificarToken, (req, res) => {
  const selectAllQuery = "SELECT * FROM categorias";

  db.all(selectAllQuery, (err, rows) => {
    if (err) {
      console.error("Error al obtener las categorías:", err);
      res.status(500).send("Error al obtener las categorías");
    } else {
      res.status(200).json(rows);
    }
  });
});

router.get("/categorias/:id", verificarToken, (req, res) => {
  const categoriaId = req.params.id;
  const selectCategoriaQuery = "SELECT * FROM categorias WHERE id = ?";
  const selectPlatillosQuery =
    "SELECT * FROM platillos WHERE id IN (SELECT json_each.value FROM json_each((SELECT platillos FROM categorias WHERE id = ?)))";

  db.get(selectCategoriaQuery, [categoriaId], (err, categoria) => {
    if (err) {
      console.error(
        `Error al obtener la categoría con ID ${categoriaId}:`,
        err
      );
      res
        .status(500)
        .send(`Error al obtener la categoría con ID ${categoriaId}`);
    } else if (!categoria) {
      res.status(404).send(`Categoría con ID ${categoriaId} no encontrada`);
    } else {
      db.all(selectPlatillosQuery, [categoriaId], (err, platillos) => {
        if (err) {
          console.error(
            `Error al obtener los platillos de la categoría con ID ${categoriaId}:`,
            err
          );
          res
            .status(500)
            .send(
              `Error al obtener los platillos de la categoría con ID ${categoriaId}`
            );
        } else {
          const platillosIds = platillos.map((platillo) => platillo.id);
          const selectDetallesPlatillosQuery = `SELECT * FROM platillos WHERE id IN (${platillosIds.join(
            ","
          )})`;

          db.all(selectDetallesPlatillosQuery, [], (err, detallesPlatillos) => {
            if (err) {
              console.error(
                `Error al obtener los detalles de los platillos correspondientes a la categoría con ID ${categoriaId}:`,
                err
              );
              res
                .status(500)
                .send(
                  `Error al obtener los detalles de los platillos correspondientes a la categoría con ID ${categoriaId}`
                );
            } else {
              const categoriaConDetallesPlatillos = {
                id: categoria.id,
                nombre: categoria.nombre,
                descripcion: categoria.descripcion,
                foto: categoria.foto,
                platillos: detallesPlatillos,
              };
              res.status(200).json(categoriaConDetallesPlatillos);
            }
          });
        }
      });
    }
  });
});

module.exports = router;

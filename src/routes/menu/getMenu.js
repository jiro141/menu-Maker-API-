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
// Endpoint para obtener la lista de menús
router.get("/menus", verificarToken, async (req, res) => {
  const obtenerMenusQuery = "SELECT * FROM menu";
  db.all(obtenerMenusQuery, [], (err, rows) => {
    if (err) {
      console.error("Error al obtener la lista de menús:", err);
      return res.status(500).send("Error al obtener la lista de menús");
    } else {
      res.status(200).json(rows);
    }
  });
});
router.get("/menus/:id", verificarToken, async (req, res) => {
  const categoriaId = req.params.id;
  const selectMenuQuery = "SELECT * FROM menu WHERE id = ?";
  const selectPlatillosQuery =
    "SELECT * FROM categorias WHERE id IN (SELECT json_each.value FROM json_each((SELECT categorias FROM menu WHERE id = ?)))";

  try {
    const categoria = await new Promise((resolve, reject) => {
      db.get(selectMenuQuery, [categoriaId], (err, categoria) => {
        if (err) {
          console.error(`Error al obtener el menú con ID ${categoriaId}:`, err);
          reject(err);
        } else if (!categoria) {
          res.status(404).send(`Menú con ID ${categoriaId} no encontrado`);
        } else {
          resolve(categoria);
        }
      });
    });

    const categorias = await new Promise((resolve, reject) => {
      db.all(selectPlatillosQuery, [categoriaId], (err, categorias) => {
        if (err) {
          console.error(
            `Error al obtener las categorías del menú con ID ${categoriaId}:`,
            err
          );
          reject(err);
        } else {
          resolve(categorias);
        }
      });
    });

    const categoriaIds = categorias.map((categoria) => categoria.id);
    const selectDetallesCategoriasQuery = `SELECT * FROM categorias WHERE id IN (${categoriaIds.join(
      ","
    )})`;

    const detallesCategorias = await new Promise((resolve, reject) => {
      db.all(selectDetallesCategoriasQuery, [], (err, detallesCategorias) => {
        if (err) {
          console.error(
            `Error al obtener los detalles de las categorías correspondientes al menú con ID ${categoriaId}:`,
            err
          );
          reject(err);
        } else {
          resolve(detallesCategorias);
        }
      });
    });

    const platillosIds = detallesCategorias.map((platillo) =>
      JSON.parse(platillo.platillos)
    );
    const selectDetallesPlatillosQuery = `SELECT * FROM platillos WHERE id IN (${platillosIds.join(
      ","
    )})`;

    const detallesPlatillos = await new Promise((resolve, reject) => {
      db.all(selectDetallesPlatillosQuery, [], (err, detallesPlatillos) => {
        if (err) {
          console.error(
            `Error al obtener los detalles de los platillos correspondientes al menú con ID ${categoriaId}:`,
            err
          );
          reject(err);
        } else {
          resolve(detallesPlatillos);
        }
      });
    });

    // console.log(catego, " datos");
    const categoriaConDetallesPlatillos = {
      id: categoria.id,
      nombre: categoria.nombre,
      descripcion: categoria.descripcion,
      platillos: detallesPlatillos,
    };
    const menuConDetallesCategorias = detallesCategorias.map(
      (categoria) => {
        const { platillos, ...categoriaSinPlatillos } = categoria;
        return {
          ...categoriaSinPlatillos,
          id: categoria.id,
          nombre: categoria.nombre,
          descripcion: categoria.descripcion,
          platillos: detallesPlatillos, // Añade detallesPlatillos si es necesario
        };
      }
    );

    console.log(categoriaConDetallesPlatillos);
    const menu = {
      id: categoria.id,
      nombre: categoria.nombre,
      banner: categoria.banner,
      logo: categoria.logo,
      categorias: menuConDetallesCategorias,
    };

    res.status(200).json(menu);
  } catch (error) {
    res.status(500).send(`Error en el servidor: ${error.message}`);
  }
});

module.exports = router;

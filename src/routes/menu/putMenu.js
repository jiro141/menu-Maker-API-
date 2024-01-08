const express = require("express");
const db = require("../../conexionDB");
const jwt = require("jsonwebtoken");
const multer = require("multer");
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
const storageBanner = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./src/images/menu/banner");
  },
  filename: function (req, file, cb) {
    cb(null, "banner-" + Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storageBanner });

router.put(
  "/editMenu/:id",
  verificarToken,
  upload.single("banner"),
  async (req, res) => {
    const menuId = req.params.id;
    const { nombre, logo, categorias } = req.body;
    const banner = req.file ? req.file.path : null;
    const updateFields = [];
    const params = [];

    if (nombre) {
      updateFields.push("nombre = ?");
      params.push(nombre);
    }

    if (banner) {
      updateFields.push("banner = ?");
      params.push(banner);
    }

    if (logo) {
      updateFields.push("logo = ?");
      params.push(logo);
    }

    if (categorias) {
      const categoriasJSON = JSON.stringify(categorias);
      updateFields.push("categorias = ?");
      params.push(categoriasJSON);
    }

    if (updateFields.length === 0) {
      return res
        .status(400)
        .json({ message: "No se proporcionaron campos para actualizar." });
    }

    params.push(menuId);

    const updateQuery = `UPDATE menu SET ${updateFields.join(
      ", "
    )} WHERE id = ?`;

    db.run(updateQuery, params, function (err) {
      if (err) {
        console.error(`Error al editar menú con ID ${menuId}:`, err);
        return res.status(500).send(`Error al editar menú con ID ${menuId}`);
      }

      if (this.changes === 0) {
        return res.status(404).send(`Menú con ID ${menuId} no encontrado`);
      }

      console.log(`Menú con ID ${menuId} editado correctamente`);

      // Obtener el menú editado
      db.get("SELECT * FROM menu WHERE id = ?", [menuId], (err, row) => {
        if (err) {
          console.error(
            `Error al obtener el menú editado con ID ${menuId}:`,
            err
          );
          return res
            .status(500)
            .send(`Error al obtener el menú editado con ID ${menuId}`);
        }

        res.status(200).json({
          message: `Menú con ID ${menuId} editado correctamente`,
          menu: row,
        });
      });
    });
  }
);

module.exports = router;

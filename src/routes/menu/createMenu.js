const express = require("express");
const db = require("../../conexionDB");
const jwt = require("jsonwebtoken");
const pdfGenerator = require("../../models/pdfGenerator");
const multer = require("multer");
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

const storageBanner = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./src/images/menu/banner");
  },
  filename: function (req, file, cb) {
    cb(null, "banner-" + Date.now() + "-" + file.originalname);
  },
});

const storageLogo = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./src/images/menu/logo");
  },
  filename: function (req, file, cb) {
    cb(null, "logo-" + Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storageBanner });
const uploadLogo = multer({ storage: storageLogo });

router.post(
  "/createMenu",
  verificarToken,
  upload.single("banner"),
  (req, res) => {
    const { nombre, categorias } = req.body;
    console.log(categorias, categorias);
    if (!nombre || !categorias) {
      return res.status(400).json({ message: "Faltan campos obligatorios." });
    }

    const categoriasJSON = JSON.stringify(categorias);
    const banner = req.file ? req.file.path : null;
    const logo = req.file ? req.file.path : null;

    const insertMenuQuery =
      "INSERT INTO menu (nombre, banner, logo, categorias) VALUES (?, ?, ?, ?)";

    db.run(
      insertMenuQuery,
      [nombre, banner, logo, categoriasJSON],
      function (err) {
        if (err) {
          console.error("Error al crear menú:", err);
          return res.status(500).json({ message: "Error al crear menú" });
        } else {
          console.log(`Menú ${nombre} creado correctamente`);
          res.status(200).json({
            message: "Menú creado correctamente",
            nombre,
            banner: banner,
            logo: logo,
            categorias,
          });
        }
      }
    );
  }
);

module.exports = router;

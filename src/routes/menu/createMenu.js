const express = require("express");
const db = require("../../conexionDB");
const jwt = require("jsonwebtoken");
const pdfGenerator = require("../../models/pdfGenerator");
const multer = require("multer");
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");
const handlebars = require("handlebars");
const router = express.Router();
const QRCode = require("qrcode");
const { useCategorias } = require("../../controllers/useCategorias");
const { usePlatillos } = require("../../controllers/usePlatillos");
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

// Función auxiliar para envolver db.run en una Promise
function runAsync(query, params) {
  return new Promise((resolve, reject) => {
    db.run(query, params, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve(this);
      }
    });
  });
}

const upload = multer({ storage: storageBanner });
const uploadLogo = multer({ storage: storageLogo });

router.post(
  "/createMenu",
  verificarToken,
  upload.single("banner"),
  async (req, res) => {
    const { nombre, categorias } = req.body;

    if (!nombre || !categorias) {
      return res.status(400).json({ message: "Faltan campos obligatorios." });
    }

    const categoriasJSON = JSON.stringify(categorias);
    const banner = req.file ? req.file.path : null;
    const logo = req.file ? req.file.path : null;

    const insertMenuQuery =
      "INSERT INTO menu (nombre, banner, logo, categorias) VALUES (?, ?, ?, ?)";

    try {
      await runAsync(insertMenuQuery, [nombre, banner, logo, categoriasJSON]);
      console.log(`Menú ${nombre} creado correctamente`);
      const categoriasConPlatillos = [];
      const consultaCategorias = await useCategorias(categorias);
      for (let index = 0; index < consultaCategorias.length; index++) {
        const element = consultaCategorias[index];
        const arrayNumeros = JSON.parse(element.platillos);
        const consultaPlatillos = await usePlatillos(arrayNumeros);
        // console.log(consultaPlatillos, "platillos consultados");
        categoriasConPlatillos.push({
          categoria: element.nombre, // Puedes ajustar según tu estructura de datos
          platillos: consultaPlatillos,
        });
      }
      console.log(categoriasConPlatillos,'categoria con platillos');

      const templateData = {
        nombre,
        categorias: categoriasConPlatillos,
      };
      // console.log(consultaCategorias, "categorias consultadas");
      const insertedId = this.lastID;
      const source = fs.readFileSync(path.join(__dirname, "menu.hbs"), "utf8");
      const template = handlebars.compile(source);
      const html = template(templateData);
      //gnerara qr
      const qrCodePath = path.join(
        __dirname,
        "qrcodes",
        `menu-${insertedId}.png`
      );
      await QRCode.toFile(
        qrCodePath,
        `http://localhost:5000/menu/${insertedId}`
      );
      // Crear PDF usando Puppeteer
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.setContent(html);

      const pdfPath = path.join(__dirname, "pdf", `menu-${insertedId}.pdf`);
      await page.pdf({ path: pdfPath, format: "A4" });

      await browser.close();

      res.status(200).json({
        message: "Menú creado correctamente",
        id: insertedId,
        nombre: nombre,
        banner: banner,
        logo: logo,
        categorias: categorias,
        pdfPath: pdfPath,
        qrCodePath: qrCodePath,
      });
    } catch (error) {
      console.error("Error al crear menú:", error);
      res.status(500).json({ message: "Error al crear menú" });
    }
  }
);

module.exports = router;

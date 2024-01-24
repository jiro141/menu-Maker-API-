const express = require("express");
const db = require("../../../conexionDB");
const jwt = require("jsonwebtoken");
const router = express.Router();
const multer = require("multer");
require("dotenv").config();

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

// Configuración de Multer para almacenar las imágenes en el disco
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./src/images/menu/platillos"); // Ruta donde guardar las imágenes (puede ser relativa al archivo actual)
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage }); // Configuración de Multer

router.post(
  "/createPlatillos",
  verificarToken,
  upload.single("foto"), // Middleware de Multer para manejar una sola imagen
  async (req, res) => {
    const { nombre, descripcion, ingredientes } = req.body;
    console.log(req.file);
    const foto = req.file ? req.file.path : null;

    const insertQuery =
      "INSERT INTO platillos (nombre, descripcion, ingredientes, foto) VALUES (?, ?, ?, ?)";
    db.run(
      insertQuery,
      [nombre, descripcion, ingredientes, foto],
      function (err) {
        if (err) {
          console.error("Error al insertar platillo:", err);
          res
            .status(500)
            .json({ success: false, message: "Error al insertar platillo" });
        } else {
          console.log(`Platillo ${nombre} insertado correctamente`);
          const insertedId = this.lastID;
          const nuevoPlatillo = {
            id: insertedId,
            nombre: nombre,
            descripcion: descripcion,
            ingredientes: ingredientes,
            foto: foto,
          };
          res.status(200).json({
            success: true,
            message: "Platillo insertado correctamente",
            platillo: nuevoPlatillo,
          });
        }
      }
    );
  }
);

module.exports = router;

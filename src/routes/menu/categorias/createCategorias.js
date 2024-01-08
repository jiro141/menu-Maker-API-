const express = require("express");
const db = require("../../../conexionDB");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const multer = require("multer");
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
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./src/images/menu/categorias"); // Ruta donde guardar las imágenes (puede ser relativa al archivo actual)
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

// Endpoint para insertar valores en la tabla categorias
router.post(
  "/createCategorias",
  verificarToken,
  upload.single("foto"),
  async (req, res) => {
    const { nombre, descripcion, platillos } = req.body;

    // despues de recibir los platillos en un arreglo
    //el metodo JSON.stringify lo tranforma para que lo pueda leer de buena manera
    const platillosJSON = JSON.stringify(platillos);
    const foto = req.file ? req.file.path : null;
    const insertCategoriaQuery =
      "INSERT INTO categorias (nombre, descripcion, platillos, foto) VALUES (?, ?, ?, ?)";
    db.run(
      insertCategoriaQuery,
      [nombre, descripcion, platillosJSON, foto],
      function (err) {
        if (err) {
          console.error("Error al insertar categoría:", err);
          return res.status(500).send("Error al insertar categoría");
        } else {
          console.log(`Categoría ${nombre} insertada correctamente`);
          const insertedId = this.lastID;
          const nuevoPlatillo = {
            id: insertedId,
            nombre: nombre,
            descripcion: descripcion,
            platillos:platillos,
            foto: foto,
          };
          res.status(200).send({mensaje:"Categoría insertada correctamente",categoria: nuevoPlatillo,});
        }
      }
    );
  }
);

module.exports = router;

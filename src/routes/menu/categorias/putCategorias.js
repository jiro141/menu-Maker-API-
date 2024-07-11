// editCategoria.js
const express = require("express");
const db = require("../../../conexionDB");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const uploadToImgur = require('../../../controllers/imgurUploader');
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

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./src/images/menu/categorias");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

router.put("/editCategoria/:id", verificarToken, upload.single("foto"), async (req, res) => {
  const categoriaId = req.params.id;
  const { nombre, descripcion, platillos } = req.body;

  // Construir la consulta de actualización
  let updateFields = [];
  let params = [];

  if (nombre) {
    updateFields.push('nombre = ?');
    params.push(nombre);
  }

  if (descripcion) {
    updateFields.push('descripcion = ?');
    params.push(descripcion);
  }

  if (platillos) {
    const platillosJSON = JSON.stringify(platillos);
    updateFields.push('platillos = ?');
    params.push(platillosJSON);
  }

  // Subir imagen a Imgur si se proporciona
  const foto = req.file ? await uploadToImgur(req.file.buffer, req.file.originalname) : null;

  if (foto) {
    updateFields.push('foto = ?');
    params.push(foto);
  }

  if (updateFields.length === 0) {
    return res.status(400).json({ message: "No se proporcionaron campos para actualizar." });
  }

  params.push(categoriaId);

  const updateQuery = `UPDATE categorias SET ${updateFields.join(', ')} WHERE id = ?`;

  db.run(updateQuery, params, function (err) {
    if (err) {
      console.error(`Error al editar categoría con ID ${categoriaId}:`, err);
      return res.status(500).send(`Error al editar categoría con ID ${categoriaId}`);
    }

    if (this.changes === 0) {
      return res.status(404).send(`Categoría con ID ${categoriaId} no encontrada`);
    }

    console.log(`Categoría con ID ${categoriaId} editada correctamente`);

    // Obtener la categoría editada
    db.get("SELECT * FROM categorias WHERE id = ?", [categoriaId], (err, row) => {
      if (err) {
        console.error(`Error al obtener la categoría editada con ID ${categoriaId}:`, err);
        return res.status(500).send(`Error al obtener la categoría editada con ID ${categoriaId}`);
      }

      res.status(200).json({
        message: `Categoría con ID ${categoriaId} editada correctamente`,
        categoria: row
      });
    });
  });
});

module.exports = router;

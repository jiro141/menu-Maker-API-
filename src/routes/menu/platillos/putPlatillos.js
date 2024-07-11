const express = require("express");
const db = require("../../../conexionDB");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const uploadToImgur = require('../../../controllers/imgurUploader');
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

// Configuración de Multer para manejar una sola imagen en memoria
const upload = multer(); 

router.put(
  "/editPlatillo/:id",
  verificarToken,
  upload.single("foto"),
  async (req, res) => {
    const platilloId = req.params.id;

    // Consulta para obtener los datos actuales del platillo
    const selectQuery = "SELECT * FROM platillos WHERE id = ?";
    db.get(selectQuery, [platilloId], async function (err, row) {
      if (err) {
        console.error(`Error al obtener platillo con ID ${platilloId}:`, err);
        return res
          .status(500)
          .send(`Error al obtener platillo con ID ${platilloId}`);
      }

      if (!row) {
        return res
          .status(404)
          .send(`Platillo con ID ${platilloId} no encontrado`);
      }

      // Comparar los datos nuevos con los existentes y actualizar solo los enviados en la solicitud
      const { nombre, descripcion, ingredientes } = req.body;
      const foto = req.file ? req.file.buffer : null;
      
      // Subir la nueva foto a Imgur
      const imgurResponse = await uploadToImgur(foto, req.file.originalname);

      // Construcción de la consulta de actualización
      let updateFields = [];
      let params = [];

      if (nombre && nombre !== row.nombre) {
        updateFields.push("nombre = ?");
        params.push(nombre);
      }

      if (descripcion && descripcion !== row.descripcion) {
        updateFields.push("descripcion = ?");
        params.push(descripcion);
      }

      if (ingredientes && ingredientes !== row.ingredientes) {
        updateFields.push("ingredientes = ?");
        params.push(ingredientes);
      }

      if (foto && foto !== row.foto) {
        updateFields.push("foto = ?");
        params.push(imgurResponse.data.link); // Utiliza el enlace de Imgur
      }

      if (updateFields.length === 0) {
        return res
          .status(400)
          .send("No se han proporcionado datos para actualizar");
      }

      params.push(platilloId); // Agregar el ID del platillo al final
      const updateQuery = `UPDATE platillos SET ${updateFields.join(
        ", "
      )} WHERE id = ?`;

      db.run(updateQuery, params, function (err) {
        if (err) {
          console.error(`Error al editar platillo con ID ${platilloId}:`, err);
          return res
            .status(500)
            .send(`Error al editar platillo con ID ${platilloId}`);
        }

        if (this.changes === 0) {
          return res
            .status(404)
            .send(`Platillo con ID ${platilloId} no encontrado`);
        }

        const updatedObject = {
          id: platilloId,
          nombre: nombre || row.nombre,
          descripcion: descripcion || row.descripcion,
          ingredientes: ingredientes || row.ingredientes,
          foto: foto || imgurResponse.data.link, // Utiliza el enlace de Imgur
        };

        res.status(200).json({
          message: `Platillo con ID ${platilloId} editado correctamente`,
          platillo: updatedObject,
        });
      });
    });
  }
);

module.exports = router;

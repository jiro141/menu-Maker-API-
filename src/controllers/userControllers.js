// controllers/userController.js
const bcrypt = require('bcrypt');
const User = require('../models/User.js');
const db = require('../conexionDB'); // Importa el modelo de usuario definido en models/User.js

const UserController = {
  async registerUser(req, res) {
    const { userName, password, userGroup } = req.body;

    if (!userName || !password || !userGroup) {
      return res.status(400).json({ message: 'Por favor, proporciona todos los campos requeridos.' });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      // Crea un nuevo usuario usando el modelo de usuario
      const newUser = await User.create({
        userName,
        password: hashedPassword,
        userGroup,
      });

      return res.status(201).json({ message: 'Usuario registrado exitosamente.', user: newUser });
    } catch (error) {
      return res.status(500).json({ message: 'Error al registrar usuario en la base de datos.' });
    }
  },
  // Otros métodos del controlador para manejar las operaciones CRUD relacionadas con usuarios
};

module.exports = UserController;

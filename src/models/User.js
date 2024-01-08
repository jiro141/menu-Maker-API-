// // models/User.js
// // models/User.js
// const bcrypt = require('bcrypt');
// const { DataTypes } = require('sequelize');
// const sequelize = require('../conexionDB');

// const User = sequelize.define('User', {
//   userName: {
//     type: DataTypes.STRING,
//     allowNull: false,
//     unique: true,
//   },
//   password: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   },
// });

// User.beforeCreate(async (user) => {
//   const hashedPassword = await bcrypt.hash(user.password, 10);
//   user.password = hashedPassword;
// });

// module.exports = User;


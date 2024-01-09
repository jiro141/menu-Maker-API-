const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors"); // Importa el middleware cors
const resetInventario = require("./controllers/setInventario");
const login = require("./routes/login");
const createPlatillos = require("./routes/menu/platillos/createPlatillos");
const createCategorias = require("./routes/menu/categorias/createCategorias");
const createMenu = require("./routes/menu/createMenu");
const putplatillo = require("./routes/menu/platillos/putPlatillos");
const putCategoria = require("./routes/menu/categorias/putCategorias");
const putMenu = require("./routes/menu/putMenu");
const deletePlatillo = require("./routes/menu/platillos/deletePlatillos");
const deleteCategorias = require("./routes/menu/categorias/deleteCategorias");
const deleteMenu = require("./routes/menu/deleteMenu");
const getPlatillos = require("./routes/menu/platillos/getPlatillos");
const getCategorias = require("./routes/menu/categorias/getCategorias");
const getMenu = require("./routes/menu/getMenu");
const postInventario = require("./routes/inventario/postInventario");
const putInventario = require("./routes/inventario/putInventario");
const deleteInventario = require("./routes/inventario/deleteInventario");
const getInventario = require("./routes/inventario/getInventario");
const userRoutes = require("./routes/userRoutes");
const postPedidos = require("./routes/pedidos/postPedidos");
const putPedidos = require("./routes/pedidos/putPedidos");
const deletePedidos = require("./routes/pedidos/deletePedidos");
const getPedidos = require('./routes/pedidos/getPedidos')
const app = express();

// Middleware para analizar datos JSON
app.use(express.json());

// Integra el middleware cors en tu aplicación
app.use(cors());
// resetInventario();
// Rutas
app.use(putPedidos);
app.use(userRoutes);
app.use(login);
app.use(createPlatillos);
app.use(createCategorias);
app.use(createMenu);
app.use(putplatillo);
app.use(putCategoria);
app.use(putMenu);
app.use(deletePlatillo);
app.use(deleteCategorias);
app.use(deleteMenu);
app.use(getPlatillos);
app.use(getCategorias);
app.use(getMenu);
app.use(postInventario);
app.use(putInventario);
app.use(deleteInventario);
app.use(getInventario);
app.use(postPedidos);
app.use(deletePedidos)
app.use(getPedidos);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Servidor Express iniciado en el puerto ${PORT}`);
});

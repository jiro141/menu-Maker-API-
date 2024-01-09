const db = require("../conexionDB");
async function actualizarDetallesDB(idPedido, detalle) {
  const { platillo, nuevaCantidad } = detalle;
  const nuevaCantidadArray = detalle.map((detalle) => detalle.nuevaCantidad);
  const platilloArray = detalle.map((detalle) => detalle.platillo);
  const nuevaCantidadString = nuevaCantidadArray.join(", "); // Une los elementos con una coma y un espacio
  const platilloString = platilloArray.join(", ");
  const updateDetalleQuery =
    "UPDATE pedidos SET cantidad = ?, platillos = ? WHERE id = ?";
  await db.run(updateDetalleQuery, [
    nuevaCantidadString,
    platilloString,
    idPedido,
  ]);
}

// Exportar la función para su uso en otras partes del código
module.exports = { actualizarDetallesDB };

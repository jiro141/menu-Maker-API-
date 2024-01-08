const wkhtmltopdf = require("wkhtmltopdf");

function generarPDFMenu(nombre, banner, logo, categorias, res) {
  const categoriasJSON = JSON.stringify(categorias);
  const htmlContent = `
    <html>
      <head>
        <title>Menú: ${nombre}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
          }
          h1 {
            text-decoration: underline;
          }
        </style>
      </head>
      <body>
        <h1>Menú: ${nombre}</h1>
        <p>Banner: ${banner}</p>
        <p>Logo: ${logo}</p>
        <p>Categorías: ${categoriasJSON}</p>
      </body>
    </html>
  `;

  const options = {
    pageSize: "letter",
    output: `attachment; filename="${nombre}.pdf"`,
  };

  wkhtmltopdf(htmlContent, options).pipe(res);
}

module.exports = {
  generarPDFMenu,
};

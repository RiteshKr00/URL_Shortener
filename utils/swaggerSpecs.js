const swaggerJsDoc = require("swagger-jsdoc");
const specs = swaggerJsDoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Url Shortener",
      version: "1.0.0",
      description: "Hash url to short length",
      termsOfService: "http://urlshortener/terms/",
      contact: {
        email: "kumarritesh14062000@gmail.com",
      },
      license: {
        name: "MIT",
        url: "https://spdx.org/licenses/MIT.html",
      },
    },
    servers: [
      {
        url: process.env.base_url,
      },
    ],
  },
  tags: [
    {
      name: "Url",
      description: "Operation on urls",
    },
  ],
  apis: ["./routes/*.js"],
});
module.exports = specs;

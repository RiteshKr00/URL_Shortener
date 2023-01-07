const express = require("express");
const app = express();
const { connectDB } = require("./config/db");
const urlroutes = require("./routes/url");
const swaggerUI = require("swagger-ui-express");
const swaggerSpecs = require("./utils/swaggerSpecs");
require("dotenv").config();

//middlewares
app.use(express.json());
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerSpecs));
//Database connection
connectDB();

//routes
app.use("/api/v1/", urlroutes);

app.listen(process.env.PORT || 8080, () => {
  console.log("Server is runnng at port", process.env.PORT);
});

const express = require("express");
const app = express();
const mongoose = require("mongoose");
require("dotenv").config();

//middlewares
app.use(express.json());

//mongoose connection
mongoose.connect(process.env.MONGOURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on("connected", () => {
  console.log("connected to mongo");
});
mongoose.connection.on("error", () => {
  console.log("error connecting to mongo");
  //exit
  process.exit(1);
});

app.listen(process.env.PORT || 8080, () => {
  console.log("Server is runnng at port", process.env.PORT);
});

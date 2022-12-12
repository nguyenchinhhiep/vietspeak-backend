const express = require("express");
const app = express();
const api = require("./api");
const dotenv = require("dotenv");
const morgan = require("morgan");
const cors = require("cors");
const configs = process.env;

dotenv.config();

app.set("port", configs.API_PORT || 1996);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cors());

app.use("/api", api);
app.use(express.static("static"));

app.use(morgan("dev"));

app.use(function (req, res) {
  res.status(404).json({
    status: "error",
    message: "Not Found",
  });
});

//  MongoDB connection
const mongoose = require("mongoose");

mongoose.set("strictQuery", false);

mongoose.connect(String(configs.MONGO_URL));

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error:"));

db.once("open", () => {
  console.log("Connected to MongoDB");

  app.listen(app.get("port"), () => {
    console.log(`API Server is listening on port ${app.get("port")}`);
  });
});

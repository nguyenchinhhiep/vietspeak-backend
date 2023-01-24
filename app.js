const express = require("express");
const app = express();
const api = require("./api");
const dotenv = require("dotenv");
const morgan = require("morgan");
const cors = require("cors");
const cloudinary = require("cloudinary").v2;
const { connectDB } = require("./config/db");
const config = process.env;

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

connectDB();

app.set("port", config.API_PORT || 1996);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: false, limit: "50mb" }));

app.use(cors());

app.use("/api", api);
app.use(express.static("static"));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(function (req, res) {
  res.status(404).json({
    status: "error",
    message: "Not found",
  });
});

app.listen(app.get("port"), () => {
  console.log(`API Server is listening on port ${app.get("port")}`);
});

module.exports = app;

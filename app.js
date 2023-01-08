const express = require("express");
const app = express();
const api = require("./api");
const dotenv = require("dotenv");
const morgan = require("morgan");
const cors = require("cors");
const { connectDB } = require("./config/db");
const config = process.env;

dotenv.config();

connectDB();

app.set("port", config.API_PORT || 1996);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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

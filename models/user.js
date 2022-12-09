const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: { type: String },
  firstName: { type: String, default: null },
  lastName: { type: String, default: null },
  accessToken: { type: String },
  refreshToken: { type: String },
});

module.exports = mongoose.model("User", userSchema);

const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
    },
    // permisions: [
    //   {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "Permission",
    //   },
    // ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Role", roleSchema);

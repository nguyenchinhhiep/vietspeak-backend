const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    email: { type: String, trim: true, unique: true, required: true },
    password: { type: String },
    userType: {
      type: String,
      enum: ["Admin", "Tutor", "Student"],
    },
    status: {
      type: String,
      enum: ["Active", "Inactive", "Pending", "Reviewing", "Blocked"],
      default: "Pending",
    },
    name: { type: String },
    avatar: { type: String },
    tutorProfile: {
      type: Schema.Types.ObjectId,
      ref: "Tutor",
    },
    studentProfile: {
      type: Schema.Types.ObjectId,
      ref: "Student",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);

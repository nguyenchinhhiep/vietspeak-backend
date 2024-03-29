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
      enum: ["Active", "Pending", "Reviewing", "Blocked"],
      default: "Pending",
    },
    firstName: { type: String },
    lastName: { type: String },
    name: { type: String },
    avatar: { type: String },
    avatarPublicId: { type: String },
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

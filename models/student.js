const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const studentSchema = new mongoose.Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    dob: {
      type: Date,
    },
    learningLanguage: {
      type: String,
      enum: ["English"],
    },
    currentLevel: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
    },

    heardFrom: {
      type: String,
      enum: ["Web Search", "Social Media", "Friend / Family", "Other"],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Student", studentSchema);

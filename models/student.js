const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const studentSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    learningLanguage: {
      type: String,
      enum: ["English"],
      required: true,
    },
    currentLevel: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      required: true,
    },
    heardFrom: {
      type: String,
      enum: ["Web Search", "Social Media", "Friend / Family", "Other"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Student", studentSchema);

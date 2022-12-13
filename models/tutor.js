const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const tutorSchema = new mongoose.Schema(
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
    teachingLanguage: {
      type: String,
      enum: ["English"],
    },
    teachingExperience: {
      type: String,
      enum: [
        "No",
        "1 - 6 months",
        "7 - 12 months",
        "1 - 2 years",
        "More than 2 years",
      ],
    },
    haveExperienceTeachingOnline: {
      type: Boolean,
    },
    reasonHere: {
      type: String,
    },
    introduction: {
      type: String,
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

module.exports = mongoose.model("Tutor", tutorSchema);

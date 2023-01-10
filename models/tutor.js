const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const tutorSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    firstName: { type: String, trim: true, required: true },

    lastName: { type: String, trim: true, require: true },
    dob: {
      type: Date,
      require: true,
    },
    teachingLanguage: {
      type: String,
      enum: ["English"],
    },
    teachingJobs: {
      type: [String],
    },
    languages: {
      type: [
        {
          language: String,
          fluency: String,
        },
      ],
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
    teachingCertificates: {
      type: [
        {
          originalname: String,
          filename: String,
          size: Number,
          url: String,
        },
      ],
      // require: true,
    },
    haveExperienceTeachingOnline: {
      type: Boolean,
      require: true,
    },
    reasonHere: {
      type: String,
      trim: true,
    },
    introduction: {
      type: String,
      trim: true,
    },
    videoIntroduction: {
      type: String,
      trim: true,
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

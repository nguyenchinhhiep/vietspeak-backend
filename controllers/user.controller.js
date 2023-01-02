const User = require("../models/user");
const Tutor = require("../models/tutor");
const Student = require("../models/student");

const getUserProfile = async (req, res) => {
  try {
    const { email } = req.user;

    const user = await User.findOne({ email: email.toLowerCase() })
      .populate("tutorProfile")
      .populate("studentProfile");

    if (!user) {
      return res.status(400).json({
        status: "success",
        message: "User not found",
      });
    }

    const userProfile = {
      ...user.toJSON(),
    };

    delete userProfile["password"];

    return res.status(200).json({
      status: "success",
      data: userProfile,
    });
  } catch (err) {
    res.status(400).json({ status: "error", message: err.message });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const { userId, email } = req.user;

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(400).json({
        status: "success",
        message: "User not found",
      });
    }

    const userType = user.userType;
    const userProfile = req.body || {};
    const { tutorProfile, studentProfile } = userProfile;

    if (userType === "Tutor") {
      const tutor = await Tutor.findOne({ userId: userId });
      if (tutor) {
        // Update tutor profile
      } else {
        // Create new tutor profile
        const newTutor = new Tutor({
          userId,
          ...tutorProfile,
        });

        const createdTutor = await newTutor.save();
      }
    }

    if (userType === "Student") {
      const student = await Student.findOne({ userId: userId });
      if (student) {
      } else {
        // Create new student profile
        const newStudent = new Tutor({
          userId,
          ...studentProfile,
        });

        const createdStudent = await newStudent.save();
      }
    }

    const userData = {
      ...user.toJSON(),
      ...userProfile,
    };

    delete userData["tutorProfile"];
    delete userData["studentProfile"];
  } catch (err) {
    res.status(400).json({ status: "error", message: err.message });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
};

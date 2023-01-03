const User = require("../models/user");
const Tutor = require("../models/tutor");
const Student = require("../models/student");

const getUserProfile = async (req, res) => {
  try {
    const { email } = req.user;

    const user = await User.findOne({ email: email.toLowerCase() })
      .select("-password")
      .populate("tutorProfile")
      .populate("studentProfile");

    if (!user) {
      return res.status(400).json({
        status: "success",
        message: "User not found",
      });
    }

    const userProfile = {
      email: user.email,
      status: user.status,
      userType: user.userType,
      name: user.name,
      avatar: user.avatar,
      tutorProfile: user.tutorProfile,
      studentProfile: user.studentProfile,
    };

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

    // If user not found
    if (!user) {
      return res.status(400).json({
        status: "success",
        message: "User not found",
      });
    }

    // Retrieve user payload
    const userProfilePayload = req.body || {};

    // Update user profile
    for (const key in userProfilePayload) {
      if (key !== "tutorProfile" && key !== "studentProfile") {
        user[key] = userProfilePayload[key];
      }
    }

    const { tutorProfile, studentProfile } = userProfilePayload;

    const userType = userProfilePayload.userType;

    // If user is tutor
    if (userType === "Tutor") {
      const tutor = await Tutor.findOne({ userId: userId });
      if (tutor) {
        // Update tutor profile
        for (const key in tutorProfile) {
          tutor[key] = tutorProfile[key];
        }
        await tutor.save();
      } else {
        // Create new tutor profile
        const newTutor = new Tutor({
          userId,
          ...tutorProfile,
        });

        await newTutor.save();
      }
    }

    // If user is student
    if (userType === "Student") {
      const student = await Student.findOne({ userId: userId });
      if (student) {
        for (const key in studentProfile) {
          student[key] = studentProfile[key];
        }

        await student.save();
      } else {
        // Create new student profile
        const newStudent = new Student({
          userId,
          ...studentProfile,
        });

        const createdStudent = await newStudent.save();
        user.studentProfile = createdStudent._id;
      }
    }

    // Save user
    await user.save();

    return res.status(200).json({
      status: "success",
      message: "User updated",
    });
  } catch (err) {
    res.status(400).json({ status: "error", message: err.message });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
};

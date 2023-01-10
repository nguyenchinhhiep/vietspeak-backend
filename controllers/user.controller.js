const User = require("../models/user");
const Tutor = require("../models/tutor");
const Student = require("../models/student");
const bcrypt = require("bcryptjs");
const config = process.env;

function getName(user) {
  let name = "";
  if (user.userType === "Admin") {
    name = user.firstName ? user.firstName + " " + user.lastName : "";
  }

  if (user.userType === "Student") {
    name = user.studentProfile?.firstName
      ? user.studentProfile.firstName + " " + user.studentProfile?.lastName
      : "";
  }

  if (user.userType === "Tutor") {
    name = user.tutorProfile?.firstName
      ? user.tutorProfile?.firstName + " " + user.tutorProfile?.lastName
      : "";
  }

  return name.trim();
}

function isCompletedProfile(profile = {}, includedKeys = []) {
  let isCompleted = true;

  for (const key in profile) {
    if (!includedKeys.includes(key)) {
      continue;
    }

    if (
      profile[key] == null ||
      profile[key] == "" ||
      profile[key].length === 0
    ) {
      isCompleted = false;
      break;
    }
  }

  return isCompleted;
}

const changePasswordHandler = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const { email } = req.user;

    // Check user input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        status: "error",
        message: "Current password and new password are required",
      });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(400).json({
        status: "error",
        message: "User does not exist",
      });
    }

    const isValidPassword = await bcrypt.compare(
      currentPassword,
      user.password || ""
    );

    if (!isValidPassword) {
      return res.status(400).json({
        status: "error",
        message: "Incorrect current password",
      });
    }

    // Validate password length
    if (newPassword?.length < 6) {
      return res.status(400).json({
        status: "error",
        message: "Password must be at least 6 characters long",
      });
    }

    // Hash password
    const encryptedPassword = await bcrypt.hash(
      newPassword,
      Number(config.SALT_ROUND)
    );

    // Update password
    user.password = encryptedPassword;

    // Save user
    await user.save();

    return res.status(200).send({
      status: "success",
      message: "Password updated",
    });
  } catch (err) {
    res.status(400).json({ status: "error", message: err.message });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const { email } = req.user;

    const user = await User.findOne({
      email: email.toLowerCase(),
    })
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
      name: getName(user),
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

    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    // If user not found
    if (!user) {
      return res.status(400).json({
        status: "success",
        message: "User not found",
      });
    }

    // Retrieve user payload
    const userProfilePayload = req.body || {};

    // If user update email
    if (userProfilePayload.email) {
      const existingUser = await User.findOne({
        email: userProfilePayload.email.toLowerCase(),
      });

      if (existingUser) {
        return res.status(400).json({
          status: "error",
          message: "Email already exists",
        });
      }
    }

    // Update user profile
    for (const key in userProfilePayload) {
      if (
        key !== "tutorProfile" &&
        key !== "studentProfile" &&
        key !== "userType"
      ) {
        user[key] = userProfilePayload[key];
      }
    }

    const { tutorProfile, studentProfile } = userProfilePayload;

    const userType = userProfilePayload.userType || user.userType;

    // If user is tutor
    if (userType === "Tutor") {
      user.userType = "Tutor";

      // Find student profile
      const tutor = await Tutor.findOne({ userId: userId });
      if (tutor) {
        // Update tutor profile
        for (const key in tutorProfile) {
          tutor[key] = tutorProfile[key];
        }
        // Save
        await tutor.save();

        // Check is completed profile
        const isCompleted = isCompletedProfile(tutor, [
          "userId",
          "firstName",
          "lastName",
          "dob",
          "teachingLanguage",
          "teachingJobs",
          "languages",
          "teachingExperience",
          "teachingCertificates",
          "haveExperienceTeachingOnline",
          "reasonHere",
          "introduction",
          "heardFrom",
        ]);
        if (isCompleted && user.status === "Pending") {
          user.status = "Reviewing";
        }
      } else {
        // Create new tutor profile
        const newTutor = new Tutor({
          userId,
          ...tutorProfile,
        });
        // Save
        const createdTutor = await newTutor.save();
        user.tutorProfile = createdTutor._id;

        // Check is completed profile
        const isCompleted = isCompletedProfile(createdTutor, [
          "userId",
          "firstName",
          "lastName",
          "dob",
          "teachingLanguage",
          "teachingJobs",
          "languages",
          "teachingExperience",
          "teachingCertificates",
          "haveExperienceTeachingOnline",
          "reasonHere",
          "introduction",
          "heardFrom",
        ]);
        if (isCompleted && user.status === "Pending") {
          user.status = "Reviewing";
        }
      }
    }

    // If user is student
    if (userType === "Student") {
      user.userType = "Student";

      // Find student profile
      const student = await Student.findOne({ userId: userId });
      if (student) {
        for (const key in studentProfile) {
          student[key] = studentProfile[key];
        }
        // Save
        await student.save();

        // Check is completed profile
        const isCompleted = isCompletedProfile(student, [
          "userId",
          "firstName",
          "lastName",
          "learningLanguage",
          "currentLevel",
          "heardFrom",
        ]);

        if (isCompleted && user.status === "Pending") {
          user.status = "Active";
        }
      } else {
        // Create new student profile
        const newStudent = new Student({
          userId,
          ...studentProfile,
        });
        // Save
        const createdStudent = await newStudent.save();
        user.studentProfile = createdStudent._id;

        // Check is completed profile
        const isCompleted = isCompletedProfile(createdStudent, [
          "userId",
          "firstName",
          "lastName",
          "learningLanguage",
          "currentLevel",
          "heardFrom",
        ]);
        if (isCompleted && user.status === "Pending") {
          user.status = "Active";
        }
      }
    }

    // Save user
    await user.save();

    return res.status(200).json({
      status: "success",
      data: {
        status: user.status,
        userType: user.userType,
      },
      message: "User updated",
    });
  } catch (err) {
    res.status(400).json({ status: "error", message: err.message });
  }
};

const getUsers = async (req, res) => {
  try {
    const pageSize = 10;
    const page = Number(req.query.pageNumber) || 1;
    const userType = req.query.userType
      ? {
          userType: {
            $and: [{ $ne: "Admin" }, { $eq: req.query.userType }],
          },
        }
      : {};
    const userStatus = req.query.userStatus
      ? {
          status: {
            $eq: req.query.userStatus,
          },
        }
      : {};

    const filter = req.query.filter
      ? {
          $or: [
            {
              email: {
                $regex: req.query.filter,
                $options: "i",
              },
            },
            {
              firstName: {
                $regex: req.query.filter,
                $options: "i",
              },
            },
            {
              lastName: {
                $regex: req.query.filter,
                $options: "i",
              },
            },
          ],
        }
      : {};

    const count = await User.countDocuments({
      ...filter,
      ...userType,
      ...userStatus,
    });
    const users = await User.find({ ...filter, ...userType, ...userStatus })
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    return res.status(200).json({
      status: "success",
      data: {
        users,
        page,
        pages: Math.ceil(count / pageSize),
      },
    });
  } catch (err) {
    res.status(400).json({ status: "error", message: err.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res
        .status(404)
        .json({ status: "error", message: "User not found" });
    }

    await user?.remove();

    res.status(200).json({ status: "success", message: "User removed" });
  } catch (err) {
    res.status(400).json({ status: "error", message: err.message });
  }
};

// @desc    Block user
// @route   POST /api/users/:id
// @access  Private/Admin
const blockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res
        .status(404)
        .json({ status: "error", message: "User not found" });
    }

    user.status = "Blocked";

    await user.save();

    res.status(200).json({ status: "success", message: "User blocked" });
  } catch (err) {
    res.status(400).json({ status: "error", message: err.message });
  }
};

// @desc    Approve user
// @route   POST /api/users/:id
// @access  Private/Admin
const approveUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res
        .status(404)
        .json({ status: "error", message: "User not found" });
    }

    if (user.status === "Reviewing") {
      user.status = "Active";
    }

    await user.save();

    return res
      .status(200)
      .json({ status: "success", message: "User approved" });
  } catch (err) {
    res.status(400).json({ status: "error", message: err.message });
  }
};

// @desc    Reject user
// @route   POST /api/users/:id
// @access  Private/Admin
const rejectUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res
        .status(404)
        .json({ status: "error", message: "User not found" });
    }

    if (user.status !== "Reviewing") {
      return res
        .status(400)
        .json({ status: "error", message: "Invalid request" });
    }

    // Set user status to Pending
    user.status = "Pending";

    // Send email to notify user

    await user.save();

    return res
      .status(200)
      .json({ status: "success", message: "User rejected" });
  } catch (err) {
    res.status(400).json({ status: "error", message: err.message });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate("tutorProfile")
      .populate("studentProfile");

    if (!user) {
      return res
        .status(404)
        .json({ status: "error", message: "User not found" });
    }

    return res.status(200).json({ status: "success", data: user });
  } catch (err) {
    res.status(400).json({ status: "error", message: err.message });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    // If user not found
    if (!user) {
      return res.status(400).json({
        status: "success",
        message: "User not found",
      });
    }

    // Retrieve user payload
    const userProfilePayload = req.body || {};

    // If user update email
    if (userProfilePayload.email) {
      const existingUser = await User.findOne({
        email: userProfilePayload.email.toLowerCase(),
      });

      if (existingUser) {
        return res.status(400).json({
          status: "error",
          message: "Email already exists",
        });
      }
    }

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
      const tutor = await Tutor.findOne({ userId: req.params.id });
      if (tutor) {
        // Update tutor profile
        for (const key in tutorProfile) {
          tutor[key] = tutorProfile[key];
        }
        await tutor.save();
      } else {
        // Create new tutor profile
        const newTutor = new Tutor({
          userId: req.params.id,
          ...tutorProfile,
        });

        await newTutor.save();
      }
    }

    // If user is student
    if (userType === "Student") {
      const student = await Student.findOne({ userId: req.params.id });
      if (student) {
        for (const key in studentProfile) {
          student[key] = studentProfile[key];
        }

        await student.save();
      } else {
        // Create new student profile
        const newStudent = new Student({
          userId: req.params.id,
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
  changePasswordHandler,
  getUserProfile,
  updateUserProfile,
  getUsers,
  deleteUser,
  blockUser,
  approveUser,
  rejectUser,
  getUserById,
  updateUser,
};

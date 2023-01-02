const User = require("../models/user");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const Token = require("../models/token");
const sendEmail = require("../email/sendPasswordResetEmail");
const { verifyRefreshToken } = require("../helpers/auth");
const config = process.env;

const loginHandler = async (req, res) => {
  try {
    // Get user input
    const { email, password } = req.body;

    // Check user input
    if (!email || !password) {
      return res.status(400).json({
        status: "error",
        message: "Email and password are required",
      });
    }

    // Find user
    const user = await User.findOne({ email: email });

    if (user && (await bcrypt.compare(password, user.password || ""))) {
      // Create tokens
      const accessToken = jwt.sign(
        {
          userId: user._id,
          email: user.email,
        },
        String(config.ACCESS_TOKEN_SECRET),
        {
          algorithm: "HS256",
          expiresIn: config.ACCESS_TOKEN_LIFE,
        }
      );

      const refreshToken = jwt.sign(
        {
          email: user.email,
        },
        String(config.REFRESH_TOKEN_SECRET),
        {
          algorithm: "HS256",
          expiresIn: config.REFRESH_TOKEN_LIFE,
        }
      );

      const userData = {
        ...user.toJSON(),
        accessToken,
        refreshToken,
      };

      delete userData["password"];

      res.status(200).json({
        status: "success",
        data: userData,
      });
    } else {
      res.status(200).send({
        status: "error",
        message: "Incorrect email or password",
      });
    }
  } catch (err) {
    res.status(400).json({ status: "error", message: err.message });
  }
};

const registerHandler = async (req, res) => {
  try {
    // Get user input
    const { email, password } = req.body;

    // Check user input
    if (!email || !password) {
      return res.status(400).json({
        status: "error",
        message: "Email and password are required",
      });
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      res.status(409);
      return res.json({
        status: "error",
        message: "Email already exists",
      });
    }

    // Hash password
    const encryptedPassword = await bcrypt.hash(
      password,
      Number(config.SALT_ROUND)
    );

    // Create user
    const newUser = await User.create({
      email: email.toLowerCase(),
      password: encryptedPassword,
    });

    // Create tokens
    const accessToken = jwt.sign(
      {
        userId: newUser._id,
        email: newUser.email,
      },
      String(config.ACCESS_TOKEN_SECRET),
      {
        algorithm: "HS256",
        expiresIn: config.ACCESS_TOKEN_LIFE,
      }
    );

    const refreshToken = jwt.sign(
      {
        email: newUser.email,
      },
      String(config.REFRESH_TOKEN_SECRET),
      {
        algorithm: "HS256",
        expiresIn: config.REFRESH_TOKEN_LIFE,
      }
    );

    const userData = {
      ...newUser.toJSON(),
      accessToken,
      refreshToken,
    };

    delete userData["password"];

    res.status(201).json({
      status: "success",
      data: userData,
    });
  } catch (err) {
    res.status(400).json({ status: "error", message: err.message });
  }
};

const forgotPasswordHandler = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).send({
        status: "error",
        message: "User does not exist",
      });
    }

    const token = await Token.findOne({ userId: user._id });

    // Delete the token
    if (token) {
      token.deleteOne();
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hash = await bcrypt.hash(resetToken, Number(config.SALT_ROUND));

    // Create new token
    await Token.create({
      userId: user._id,
      token: hash,
      createdAt: Date.now(),
    });

    const link = `${config.CLIENT_URL}/password-reset?token=${resetToken}&userId=${user._id}`;

    sendEmail(
      user.email,
      "Password Reset Request",
      {
        link: link,
      },
      "./templates/resetPasswordRequest.handlebars"
    ).then((_) => {
      return res.status(200).send({
        status: "success",
        message: "Sent password reset email successfully",
      });
    });
  } catch (err) {
    res.status(400).json({ status: "error", message: err.message });
  }
};

const passwordResetHandler = async (req, res) => {
  try {
    const { userId, token, password } = req.body;

    // Check user input
    if (!userId || !token || !password) {
      return res.status(400).json({
        status: "error",
        message: "Token and userId and password are required",
      });
    }

    // Find the token
    const passwordResetToken = await Token.findOne({ user: userId });

    if (!passwordResetToken) {
      return res.status(400).json({
        status: "error",
        message: "Invalid password reset token",
      });
    }

    // Check valid token
    const isValid = await bcrypt.compare(token, passwordResetToken.token);

    if (!isValid) {
      return res.status(400).json({
        status: "error",
        message: "Invalid password reset token",
      });
    }

    // Hash password
    const encryptedPassword = await bcrypt.hash(
      password,
      Number(config.SALT_ROUND)
    );

    // Update user
    await User.updateOne(
      {
        _id: userId,
      },
      {
        $set: { password: encryptedPassword },
      }
    );

    const user = await User.findById({ _id: userId });

    if (!user) {
      return res.status(400).json({
        status: "error",
        message: "User does not exist",
      });
    }

    const link = `${config.CLIENT_URL}/login`;

    sendEmail(
      user.email,
      "Password Changed Successfully",
      {
        link: link,
      },
      "./templates/resetPassword.handlebars"
    ).then(async (_) => {
      // Delete the old token
      await passwordResetToken.deleteOne();

      return res.status(200).send({
        status: "success",
        message: "Update password successfully",
      });
    });
  } catch (err) {
    res.status(400).json({ status: "error", message: err.message });
  }
};

const refreshTokenHandler = async (req, res) => {
  try {
    // Get user input
    const { email, refreshToken } = req.body;

    // Check user input
    if (!email || !refreshToken) {
      return res.status(400).json({
        status: "error",
        message: "Email and refreshToken are required",
      });
    }

    // Check valid token
    const isValid = verifyRefreshToken(email, refreshToken);

    if (!isValid) {
      return res.status(401).json({
        status: "error",
        message: "Invalid token",
      });
    }

    // Find user
    const user = await User.findOne({ email: email });

    if (user) {
      // Create token
      const accessToken = jwt.sign(
        {
          userId: user._id,
          email: user.email,
        },
        String(config.ACCESS_TOKEN_SECRET),
        {
          algorithm: "HS256",
          expiresIn: config.ACCESS_TOKEN_LIFE,
        }
      );

      const userData = {
        ...user.toJSON(),
        accessToken,
        refreshToken,
      };

      return res.status(200).json({ status: "success", data: userData });
    } else {
      return res.status(400).json({
        status: "error",
        message: "User not found",
      });
    }
  } catch (err) {
    res.status(400).json({ status: "error", message: err.message });
  }
};

const checkEmailHandler = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(200).json({
        status: "success",
        data: false,
      });
    }

    return res.status(200).json({
      status: "success",
      data: true,
    });
  } catch (err) {
    res.status(400).json({ status: "error", message: err.message });
  }
};

module.exports = {
  loginHandler,
  registerHandler,
  forgotPasswordHandler,
  passwordResetHandler,
  refreshTokenHandler,
  checkEmailHandler,
};

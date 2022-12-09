const User = require("../../models/user");
const bcrypt = require("bcryptjs");
const authConfig = require("./../../configs/auth");
const jwt = require("jsonwebtoken");

module.exports = (router) => {
  router.post("/register", async (req, res) => {
    try {
      // Get user input
      const { email, password } = req.body;

      // Check if email already exists
      const existingEmail = await User.find({ email });
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
        authConfig.saltRound
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
        process.env.ACCESS_TOKEN_SECRET || "",
        {
          algorithm: "HS256",
          expiresIn: process.env.ACCESS_TOKEN_LIFE,
        }
      );

      newUser.accessToken = accessToken;

      const refreshToken = jwt.sign(
        {
          email: newUser.email,
        },
        process.env.REFRESH_TOKEN_SECRET || "",
        {
          algorithm: "HS256",
          expiresIn: process.env.REFRESH_TOKEN_LIFE,
        }
      );

      newUser.refreshToken = refreshToken;

      res.status(201).json({
        status: "success",
        data: newUser,
      });
    } catch (err) {
      console.log(err);
    }
  });
};

const User = require("../../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const configs = process.env;

module.exports = (router) => {
  router.post("/register", async (req, res) => {
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
        Number(configs.SALT_ROUND)
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
        String(configs.ACCESS_TOKEN_SECRET),
        {
          algorithm: "HS256",
          expiresIn: configs.ACCESS_TOKEN_LIFE,
        }
      );

      const refreshToken = jwt.sign(
        {
          email: newUser.email,
        },
        String(configs.REFRESH_TOKEN_SECRET),
        {
          algorithm: "HS256",
          expiresIn: configs.REFRESH_TOKEN_LIFE,
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
  });
};

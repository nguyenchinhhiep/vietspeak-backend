const User = require("../../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const configs = process.env;

module.exports = (router) => {
  router.post("/register", async (req, res) => {
    try {
      // Get user input
      const { email, password } = req.body;

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
        configs.SALT_ROUND || 10
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
        configs.ACCESS_TOKEN_SECRET || "",
        {
          algorithm: "HS256",
          expiresIn: configs.ACCESS_TOKEN_LIFE,
        }
      );

      newUser.accessToken = accessToken;

      const refreshToken = jwt.sign(
        {
          email: newUser.email,
        },
        configs.REFRESH_TOKEN_SECRET || "",
        {
          algorithm: "HS256",
          expiresIn: configs.REFRESH_TOKEN_LIFE,
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

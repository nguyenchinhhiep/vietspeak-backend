const User = require("./../../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const configs = process.env;

module.exports = (router) => {
  router.post("/login", async (req, res) => {
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
          String(configs.ACCESS_TOKEN_SECRET),
          {
            algorithm: "HS256",
            expiresIn: configs.ACCESS_TOKEN_LIFE,
          }
        );

        user.accessToken = accessToken;

        const refreshToken = jwt.sign(
          {
            email: user.email,
          },
          String(configs.REFRESH_TOKEN_SECRET),
          {
            algorithm: "HS256",
            expiresIn: configs.REFRESH_TOKEN_LIFE,
          }
        );

        user.refreshToken = refreshToken;

        res.status(201).json({
          status: "success",
          data: user,
        });
      } else {
        res.status(400).send({
          status: "error",
          message: "Incorrect email or password",
        });
      }
    } catch (err) {
      console.log(err);
    }
  });
};

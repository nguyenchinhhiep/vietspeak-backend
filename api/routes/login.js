const User = require("./../../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

module.exports = (router) => {
  router.post("/login", async (req, res) => {
    try {
      // Get user input
      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({ email: email });

      if (user && (await bcrypt.compare(user.password || "", password))) {
        // Create tokens
        const accessToken = jwt.sign(
          {
            userId: user._id,
            email: user.email,
          },
          process.env.ACCESS_TOKEN_SECRET || "",
          {
            algorithm: "HS256",
            expiresIn: process.env.ACCESS_TOKEN_LIFE,
          }
        );

        user.accessToken = accessToken;

        const refreshToken = jwt.sign(
          {
            email: user.email,
          },
          process.env.REFRESH_TOKEN_SECRET || "",
          {
            algorithm: "HS256",
            expiresIn: process.env.REFRESH_TOKEN_LIFE,
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

  router.post("/refreshToken", async (req, res) => {
    
  });
};

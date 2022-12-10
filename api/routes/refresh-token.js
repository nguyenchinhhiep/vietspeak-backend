const User = require("./../../models/user");
const jwt = require("jsonwebtoken");
const { verifyRefreshToken } = require("./../../helpers/auth");
const config = process.env;

module.exports = (router) => {
  router.post("/refresh-token", async (req, res) => {
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
          config.ACCESS_TOKEN_SECRET || "",
          {
            algorithm: "HS256",
            expiresIn: config.ACCESS_TOKEN_LIFE,
          }
        );

        return res.status(200).json({ status: "success", data: accessToken });
      } else {
        return res.status(400).json({
          status: "error",
          message: "Not found user",
        });
      }
    } catch (err) {
      console.log(err);
    }
  });
};

const User = require("../../models/user");
const isAuthenticated = require("./../../middleware/auth");

module.exports = (router) => {
  router.get("/profile", isAuthenticated, async (req, res) => {
    try {
      const { userId, email } = req.user;

      if (!userId || !email) {
        return res.status(400).json({
          status: "error",
          message: "Invalid token",
        });
      }

      const user = await User.findOne({ email: email.toLowerCase() });

      if (!user) {
        return res.status(200).json({
          status: "success",
          data: false,
          message: "User not found",
        });
      }

      return res.status(200).json({
        status: "success",
        data: true,
        message: "User found",
      });
    } catch (err) {
      res.status(400).json({ status: "error", message: err.message });
    }
  });
};

const User = require("../../models/user");

module.exports = (router) => {
  router.post("/check-existing-email", async (req, res) => {
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
          message: "User not found",
        });
      }

      return res.status(200).json({
        status: "success",
        data: true,
        message: "User found",
      });
    } catch (err) {
      console.log(err);
    }
  });
};

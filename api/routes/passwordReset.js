const Token = require("../../models/token");
const User = require("../../models/user");
const sendEmail = require("./../../email/sendPasswordResetEmail");
const bcrypt = require("bcryptjs");
const configs = process.env;

module.exports = (router) => {
  router.post("/password-reset", async (req, res) => {
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
      const passwordResetToken = await Token.findOne({ userId });

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
        Number(configs.SALT_ROUND)
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

      const link = `${configs.CLIENT_URL}/login`;

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
      console.log(err);
    }
  });
};

const Token = require("../../models/token");
const User = require("../../models/user");
const sendEmail = require("./../../helpers/email/sendPasswordResetEmail");
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
          message: "Invalid userId or token or password",
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
        10
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

      sendEmail(
        user.email,
        "Password Reset Successfully",
        {
          name: user.firstName + " " + user.lastName,
        },
        "./templates/resetPassword.handlebars"
      );

      await passwordResetToken.deleteOne();

      return res.status(200).send({
        status: "success",
        message: "Update password successfully",
      });
    } catch (err) {
      console.log(err);
    }
  });
};

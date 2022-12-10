const User = require("./../../models/user");
const Token = require("./../../models/token");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const config = process.env;

module.exports = (router) => {
  router.post("/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;

      const user = await User.findOne({ email });

      if (!user) {
        return res.status(400).send({
          status: "error",
          message: "User does not exist",
        });
      }

      const token = await Token.findOne({ userId: user._id });

      if (token) {
        token.deleteOne();
      }

      const resetToken = crypto.randomBytes(32).toString("hex");
      const hash = await bcrypt.hash(resetToken, config.SALT_ROUND || 10);

      const newToken = await Token.create({
        userId: user._id,
        token: hash,
        createdAt: Date.now(),
      });

      const link = `${config.CLIENT_URL}/password-reset?token=${resetToken}&id=${user._id}`;


    } catch (err) {
      console.log(err);
    }
  });
};

const jwt = require("jsonwebtoken");
const configs = process.env;

const verifyRefreshToken = (email, refreshToken) => {
  try {
    const decoded = jwt.verify(
      refreshToken,
      String(configs.REFRESH_TOKEN_SECRET)
    );
    return decoded["email"] === email;
  } catch (err) {
    return false;
  }
};

module.exports = { verifyRefreshToken };

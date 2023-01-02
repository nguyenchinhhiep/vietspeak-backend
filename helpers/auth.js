const jwt = require("jsonwebtoken");
const config = process.env;

const verifyRefreshToken = (email, refreshToken) => {
  try {
    const decoded = jwt.verify(
      refreshToken,
      String(config.REFRESH_TOKEN_SECRET)
    );
    return decoded["email"] === email;
  } catch (err) {
    return false;
  }
};

module.exports = { verifyRefreshToken };

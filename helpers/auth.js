const jwt = require("jsonwebtoken");
const configs = process.env;

const verifyRefreshToken = (email, refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, configs.REFRESH_TOKEN_SECRET || "");
    return decoded["email"] === email;
  } catch (err) {
    console.log(err);
    return false;
  }
};
module.exports = { verifyRefreshToken };

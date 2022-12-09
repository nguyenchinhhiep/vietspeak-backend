const jwt = require("jsonwebtoken");
const config = process.env;

module.exports = (req, res, next) => {
  const authHeader = req.headers.get("Authorization");
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    return res.sendStatus(401).json({
      status: "error",
      message: "A token is required for authentication",
    });
  }

  try {
    const decoded = jwt.verify(token, config.ACCESS_TOKEN_SECRET || "");
    req.user = decoded;
  } catch (err) {
    return res.status(401).json({
      status: "error",
      message: "Invalid token",
    });
  }
  return next();
};

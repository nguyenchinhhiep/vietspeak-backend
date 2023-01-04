const jwt = require("jsonwebtoken");
const config = process.env;

const isAuthenticated = async (req, res, next) => {
  const authHeader = req.headers.authorization;
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

const isAdmin = async (req, res, next) => {
  if (req.user && req.user.userType === "Admin") {
    next();
  } else {
    res.status(401).json({
      status: "error",
      message: "Not authorized as an admin",
    });
  }
};

module.exports = {
  isAuthenticated,
  isAdmin,
};

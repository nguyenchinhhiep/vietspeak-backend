const isAuthenticated = require("../../middleware/auth");
const { getUserProfile } = require("../../controllers/user.controller");

module.exports = (router) => {
  router.get("/profile", isAuthenticated, getUserProfile);
};

const { isAuthenticated } = require("../../middleware/auth");
const {
  getUserProfile,
  updateUserProfile,
} = require("../../controllers/user.controller");

module.exports = (router) => {
  router
    .route("/profile")
    .get(isAuthenticated, getUserProfile)
    .put(isAuthenticated, updateUserProfile);
};

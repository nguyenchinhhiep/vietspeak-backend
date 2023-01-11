const { isAuthenticated, isAdmin } = require("../../middleware/auth");
const {
  getUserProfile,
  updateUserProfile,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require("../../controllers/user.controller");

module.exports = (router) => {
  router
    .route("/profile")
    .get(isAuthenticated, getUserProfile)
    .put(isAuthenticated, updateUserProfile);

  router
    .get("/users", isAuthenticated, isAdmin, getUsers)
    .get("/:id", isAuthenticated, isAdmin, getUserById)
    .put("/:id", isAuthenticated, isAdmin, updateUser)
    .delete("/:id", isAuthenticated, isAdmin, deleteUser);
};

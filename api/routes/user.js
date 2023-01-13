const { isAuthenticated, isAdmin } = require("../../middleware/auth");
const {
  getUserProfile,
  updateUserProfile,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  blockUser,
  approveUser,
  rejectUser,
} = require("../../controllers/user.controller");

module.exports = (router) => {
  router
    .route("/profile")
    .get(isAuthenticated, getUserProfile)
    .put(isAuthenticated, updateUserProfile);

  router
    .get("/users", isAuthenticated, isAdmin, getUsers)
    .get("/users/:id", isAuthenticated, isAdmin, getUserById)
    .put("/users/:id", isAuthenticated, isAdmin, updateUser)
    .delete("/users/:id", isAuthenticated, isAdmin, deleteUser)
    .post("/users/block/:id", isAuthenticated, isAdmin, blockUser)
    .post("/users/approve/:id", isAuthenticated, isAdmin, approveUser)
    .post("/users/reject/:id", isAuthenticated, isAdmin, rejectUser);
};

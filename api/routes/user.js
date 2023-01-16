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
  changePasswordUserHandler,
  changePasswordHandler,
} = require("../../controllers/user.controller");

module.exports = (router) => {
  router
    .get("/profile", isAuthenticated, getUserProfile)
    .put("/profile", isAuthenticated, updateUserProfile)
    .post("/change-password", isAuthenticated, changePasswordHandler);

  router
    .get("/users", isAuthenticated, isAdmin, getUsers)
    .get("/users/:id", isAuthenticated, isAdmin, getUserById)
    .put("/users/:id", isAuthenticated, isAdmin, updateUser)
    .post(
      "/users/change-password/:id",
      isAuthenticated,
      isAdmin,
      changePasswordUserHandler
    )
    .delete("/users/:id", isAuthenticated, isAdmin, deleteUser)
    .post("/users/block/:id", isAuthenticated, isAdmin, blockUser)
    .post("/users/approve/:id", isAuthenticated, isAdmin, approveUser)
    .post("/users/reject/:id", isAuthenticated, isAdmin, rejectUser);
};

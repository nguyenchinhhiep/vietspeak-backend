const {
  changePasswordHandler,
} = require("./../../controllers/user.controller");
const { isAuthenticated } = require("./../../middleware/auth");

module.exports = (router) => {
  router.post("/change-password", isAuthenticated, changePasswordHandler);
};

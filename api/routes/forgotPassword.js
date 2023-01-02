const {
  forgotPasswordHandler,
} = require("./../../controllers/auth.controller");

module.exports = (router) => {
  router.post("/forgot-password", forgotPasswordHandler);
};

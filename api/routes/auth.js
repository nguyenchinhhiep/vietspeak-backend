const {
  loginHandler,
  registerHandler,
  forgotPasswordHandler,
  refreshTokenHandler,
  passwordResetHandler,
  checkEmailHandler,
} = require("../../controllers/auth.controller");

module.exports = (router) => {
  router.post("/login", loginHandler);
  router.post("/register", registerHandler);
  router.post("/forgot-password", forgotPasswordHandler);
  router.post("/refresh-token", refreshTokenHandler);
  router.post("/password-reset", passwordResetHandler);
  router.post("/check-existing-email", checkEmailHandler);
};

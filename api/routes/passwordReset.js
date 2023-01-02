const { passwordResetHandler } = require("./../../controllers/auth.controller");

module.exports = (router) => {
  router.post("/password-reset", passwordResetHandler);
};

const { checkEmailHandler } = require("./../../controllers/auth.controller");

module.exports = (router) => {
  router.post("/check-existing-email", checkEmailHandler);
};

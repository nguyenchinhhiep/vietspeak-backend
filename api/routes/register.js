const { registerHandler } = require("./../../controllers/auth.controller");

module.exports = (router) => {
  router.post("/register", registerHandler);
};

const { loginHandler } = require("./../../controllers/auth.controller");

module.exports = (router) => {
  router.post("/login", loginHandler);
};

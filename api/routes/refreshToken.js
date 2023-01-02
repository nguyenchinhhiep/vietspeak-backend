const { refreshTokenHandler } = require("./../../controllers/auth.controller");

module.exports = (router) => {
  router.post("/refresh-token", refreshTokenHandler);
};

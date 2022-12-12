const express = require("express");
const router = express.Router();

require("./routes/login")(router);
require("./routes/register")(router);
require("./routes/forgotPassword")(router);
require("./routes/refreshToken")(router);
require("./routes/passwordReset")(router);
require("./routes/checkExistingEmail")(router);

module.exports = router;

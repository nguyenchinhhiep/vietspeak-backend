const express = require("express");
const router = express.Router();

require("./routes/login")(router);
require("./routes/register")(router);
require("./routes/forgot-password")(router);
require("./routes/refresh-token")(router);

module.exports = router;

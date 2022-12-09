const express = require("express");
const router = express.Router();

require("./routes/login")(router);
require("./routes/register")(router);

module.exports = router;

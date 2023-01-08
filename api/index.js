const express = require("express");
const router = express.Router();

require("./routes/login")(router);
require("./routes/register")(router);
require("./routes/forgotPassword")(router);
require("./routes/changePassword")(router);
require("./routes/refreshToken")(router);
require("./routes/passwordReset")(router);
require("./routes/checkExistingEmail")(router);
require("./routes/user")(router);
require("./routes/uploadAvatar")(router);
require("./routes/uploadCertificate")(router);

module.exports = router;

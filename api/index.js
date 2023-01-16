const express = require("express");
const router = express.Router();

require("./routes/auth")(router);
require("./routes/user")(router);
require("./routes/uploadAvatar")(router);
require("./routes/uploadCertificate")(router);

module.exports = router;

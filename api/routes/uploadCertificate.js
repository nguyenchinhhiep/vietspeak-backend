const path = require("path");
const multer = require("multer");
const User = require("../../models/user");
const { isAuthenticated } = require("../../middleware/auth");
const fs = require("fs");

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "uploads/certificates/");
  },
  filename(req, file, cb) {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

function checkFileType(file, cb) {
  const filetypes = /pdf/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb("Pdf only!");
  }
}

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
  limits: {
    fileSize: 1024 * 1024 * 10,
  },
});

module.exports = (router) => {
  router.post(
    "/upload-certificates",
    upload.array("certificates", 10),
    async (req, res) => {
      const { userId, email } = req.user;

      console.log(req.files);

      if (!email || !userId) {
        return res.status(400).json({
          status: "error",
          message: "Invalid token",
        });
      }

      // Get current user
      const user = await User.findOne({ email });

      //
    }
  );
};

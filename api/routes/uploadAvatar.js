const path = require("path");
const multer = require("multer");
const User = require("../../models/user");
const { isAuthenticated } = require("../../middleware/auth");
const fs = require("fs");

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "../../uploads/avatars/");
  },
  filename(req, file, cb) {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb("Images only!");
  }
}

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
  limits: {
    fileSize: 1024 * 1024 * 1,
  },
});

module.exports = (router) => {
  // Upload avatar
  router.post(
    "/avatar",
    isAuthenticated,
    upload.single("avatar"),
    async (req, res) => {
      try {
        const { userId, email } = req.user;

        if (!email || !userId) {
          return res.status(400).json({
            status: "error",
            message: "Invalid token",
          });
        }

        const base64Avatar = req.body.avatar;

        if (base64Avatar == null) {
          return res.status(400).json({
            status: "error",
            message: "No file uploaded",
          });
        }

        const base64ToArray = base64Avatar.split(";base64,");
        const imageData = base64ToArray[1];
        const extension = "png";
        const fileName = ((new Date().getTime() / 1000) | 0) + "." + extension;
        const imagePath =
          path.join(__dirname, "../../uploads/avatars/") + fileName;
        fs.writeFileSync(imagePath, imageData, { encoding: "base64" });

        // Get current user
        const user = await User.findOne({ email });

        if (!user) {
          return res.status(404).json({
            status: "error",
            message: "User not found",
          });
        }

        // Update avatar
        user.avatar = `${req.protocol}://${req.get(
          "host"
        )}/api/uploads/avatars/${fileName}`;

        // Save
        await user.save();

        return res.status(200).json({
          status: "success",
          message: "Avatar uploaded",
        });
      } catch (err) {
        res.status(400).json({ status: "error", message: err.message });
      }
    }
  );

  // Get avatar
  router.get("/uploads/avatars/:id", async (req, res) => {
    try {
      let filepath = path.join(
        __dirname + `../../../uploads/avatars/${req.params.id}`
      );

      if (fs.existsSync(filepath)) {
        res.sendFile(filepath);
      }
    } catch (err) {
      res.status(400).json({ status: "error", message: err.message });
    }
  });

  // Delete avatar
  router.delete("/avatar", isAuthenticated, async (req, res) => {
    try {
      const { userId, email } = req.user;

      if (!email || !userId) {
        return res.status(400).json({
          status: "error",
          message: "Invalid token",
        });
      }

      // Get current user
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "User not found",
        });
      }

      // Remove avatar
      user.avatar = "";

      // Save
      await user.save();

      return res.status(200).json({
        status: "success",
        message: "Avatar removed",
      });
    } catch (err) {
      res.status(400).json({ status: "error", message: err.message });
    }
  });
};

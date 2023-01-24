const path = require("path");
const multer = require("multer");
const User = require("../../models/user");
const { isAuthenticated, isAdmin } = require("../../middleware/auth");
const fs = require("fs");
const cloudinary = require("cloudinary").v2;

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "../../tmp/uploads/avatars/");
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
  storage: multer.memoryStorage(),
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

        // Get current user
        const user = await User.findOne({ email });

        if (!user) {
          return res.status(404).json({
            status: "error",
            message: "User not found",
          });
        }

        // const base64ToArray = base64Avatar.split(";base64,");
        // const imageData = base64ToArray[1];
        // const extension = "png";
        // const fileName = ((new Date().getTime() / 1000) | 0) + "." + extension;

        // const imagePath =
        //   path.join(__dirname, "../../tmp/uploads/avatars/") + fileName;
        // fs.writeFileSync(imagePath, imageData, { encoding: "base64" });

        // Upload avatar to cloudinary
        cloudinary.uploader.upload(
          base64Avatar,
          {
            folder: "Avatar",
          },
          async (err, result) => {
            if (err) {
              return res
                .status(400)
                .json({ status: "error", message: err.message });
            }
            // Update avatar
            user.avatar = result?.url;

            // Update avatar public id
            user.avatarPublicId = result?.public_id;

            // Save
            await user.save();

            return res.status(200).json({
              status: "success",
              message: "Avatar uploaded",
            });
          }
        );
      } catch (err) {
        res.status(400).json({ status: "error", message: err.message });
      }
    }
  );

  // Get avatar
  router.get("/uploads/avatars/:id", async (req, res) => {
    try {
      let filepath = path.join(
        __dirname + `../../tmp/uploads/avatars/${req.params.id}`
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

      // If no avatar
      if (!user.avatar || !user.avatarPublicId) {
        res
          .status(400)
          .json({ status: "error", message: "User has no avatar" });
      }

      // Delete avatar file
      // const avatarFileName = user.avatar?.split("/avatars/")[1];

      // const avatarDir = path.join(__dirname, "../../tmp/uploads/avatars/");

      // if (avatarFileName && fs.existsSync(avatarDir + avatarFileName)) {
      //   fs.unlinkSync(avatarDir + avatarFileName);
      // }

      // Delete avatar form cloudinary
      cloudinary.uploader.destroy(
        user.avatarPublicId || "",
        async (err, result) => {
          if (err) {
            return res
              .status(400)
              .json({ status: "error", message: err.message });
          }
          user.avatar = "";

          // Save
          await user.save();

          return res.status(200).json({
            status: "success",
            message: "Avatar removed",
          });
        }
      );
    } catch (err) {
      res.status(400).json({ status: "error", message: err.message });
    }
  });

  // @desc    Upload user avatar
  // @route   PUT /api/users/avatar/:id
  // @access  Private/Admin
  router.post(
    "/users/avatar/:id",
    isAuthenticated,
    isAdmin,
    upload.single("avatar"),
    async (req, res) => {
      try {
        const userId = req.params.id;

        const base64Avatar = req.body.avatar;

        if (base64Avatar == null) {
          return res.status(400).json({
            status: "error",
            message: "No file uploaded",
          });
        }

        // const base64ToArray = base64Avatar.split(";base64,");
        // const imageData = base64ToArray[1];
        // const extension = "png";
        // const fileName = ((new Date().getTime() / 1000) | 0) + "." + extension;
        // const imagePath =
        //   path.join(__dirname, "../../tmp/uploads/avatars/") + fileName;
        // fs.writeFileSync(imagePath, imageData, { encoding: "base64" });

        // Get current user
        const user = await User.findOne({ _id: userId });

        if (!user) {
          return res.status(404).json({
            status: "error",
            message: "User not found",
          });
        }

        // Upload avatar to cloudinary
        cloudinary.uploader.upload(
          base64Avatar,
          {
            folder: "Avatar",
          },
          async (err, result) => {
            if (err) {
              return res
                .status(400)
                .json({ status: "error", message: err.message });
            }
            // Update avatar
            user.avatar = result?.url;

            // Update avatar public id
            user.avatarPublicId = result?.public_id;

            // Save
            await user.save();

            return res.status(200).json({
              status: "success",
              message: "Avatar uploaded",
            });
          }
        );
      } catch (err) {
        res.status(400).json({ status: "error", message: err.message });
      }
    }
  );

  // Delete user avatar
  // @route   PUT /api/users/avatar/:id
  // @access  Private/Admin
  router.delete(
    "/users/avatar/:id",
    isAuthenticated,
    isAdmin,
    async (req, res) => {
      try {
        const userId = req.params.id;

        // Get user
        const user = await User.findOne({ _id: userId });

        if (!user) {
          return res.status(404).json({
            status: "error",
            message: "User not found",
          });
        }

        // If no avatar
        if (!user.avatar) {
          res
            .status(400)
            .json({ status: "error", message: "User has no avatar" });
        }

        // Delete avatar file
        // const avatarFileName = user.avatar?.split("/avatars/")[1];

        // const avatarDir = path.join(__dirname, "../../tmp/uploads/avatars/");

        // if (avatarFileName && fs.existsSync(avatarDir + avatarFileName)) {
        //   fs.unlinkSync(avatarDir + avatarFileName);
        // }

        // Delete avatar form cloudinary
        cloudinary.uploader.destroy(
          user.avatarPublicId || "",
          async (err, result) => {
            if (err) {
              return res
                .status(400)
                .json({ status: "error", message: err.message });
            }
            user.avatar = "";

            // Save
            await user.save();

            return res.status(200).json({
              status: "success",
              message: "Avatar removed",
            });
          }
        );
      } catch (err) {
        res.status(400).json({ status: "error", message: err.message });
      }
    }
  );
};

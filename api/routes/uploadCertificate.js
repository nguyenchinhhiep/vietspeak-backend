const path = require("path");
const multer = require("multer");
const User = require("../../models/user");
const { isAuthenticated, isAdmin } = require("../../middleware/auth");
const Tutor = require("../../models/tutor");
const fs = require("fs");

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "tmp/uploads/certificates/");
  },
  filename(req, file, cb) {
    cb(
      null,
      `${file.originalname}-${Date.now()}${path.extname(file.originalname)}`
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
  // Upload certificates
  router.post(
    "/certificates",
    isAuthenticated,
    upload.array("certificates", 10),
    async (req, res) => {
      const { userId, email } = req.user;

      if (!email || !userId) {
        return res.status(400).json({
          status: "error",
          message: "Invalid token",
        });
      }

      // Get current user
      const user = await User.findOne({ email });

      // Check user exists
      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "User not found",
        });
      }

      // Check user type
      if (user.userType !== "Tutor") {
        return res.status(401).json({
          status: "error",
          message: "Not authorized as an tutor",
        });
      }

      // Find tutor profile
      const tutor = await Tutor.findOne({ userId: userId });

      // Check tutor exists
      if (!tutor) {
        return res.status(404).json({
          status: "error",
          message: "Tutor not found",
        });
      }

      // Get files
      let teachingCertificates = req.files || [];

      // Check files
      if (!teachingCertificates || teachingCertificates.length === 0) {
        return res.status(400).json({
          status: "error",
          message: "No documents",
        });
      }

      teachingCertificates = teachingCertificates.map((file) => {
        return {
          originalname: file.originalname,
          filename: file.filename,
          size: file.size,
          url: `${req.protocol}://${req.get("host")}/api/uploads/certificates/${
            file.filename
          }`,
        };
      });

      //  Update certificates
      tutor.teachingCertificates = teachingCertificates;

      // Save
      await tutor.save();

      return res.status(200).json({
        status: "success",
        message: "Certificates uploaded",
        data: tutor.teachingCertificates,
      });
    }
  );

  // Get certificate
  router.get("/uploads/certificates/:id", async (req, res) => {
    try {
      let filepath = path.join(
        __dirname + `../../tmp/uploads/certificates/${req.params.id}`
      );

      if (fs.existsSync(filepath)) {
        res.sendFile(filepath);
      }
    } catch (err) {
      res.status(400).json({ status: "error", message: err.message });
    }
  });

  // Delete certificate
  router.delete("/certificates/:id", isAuthenticated, async (req, res) => {
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

      // Check user type
      if (user.userType !== "Tutor") {
        return res.status(401).json({
          status: "error",
          message: "Not authorized as an tutor",
        });
      }

      // Find student profile
      const tutor = await Tutor.findOne({ userId: userId });

      // Check tutor exists
      if (!tutor) {
        return res.status(404).json({
          status: "error",
          message: "Tutor not found",
        });
      }

      // Certificate id
      const certificateId = req.params.id;

      // Get delete certificate
      const deleteCertificate = tutor.teachingCertificates.find(
        (certificate) => certificate["_id"] == certificateId
      );

      if (!deleteCertificate) {
        return res.status(404).json({
          status: "error",
          message: "Certificate not found",
        });
      }

      const certificateDir = path.join(
        __dirname,
        "../../tmp/uploads/certificates/"
      );

      if (fs.existsSync(certificateDir + deleteCertificate.filename)) {
        fs.unlinkSync(certificateDir + deleteCertificate.filename);
      }

      // Delete certificate
      tutor.teachingCertificates = tutor.teachingCertificates.filter(
        (certificate) => certificate["_id"] != certificateId
      );

      // Save
      await tutor.save();

      return res.status(200).json({
        status: "success",
        message: "Certificate removed",
      });
    } catch (err) {
      res.status(400).json({ status: "error", message: err.message });
    }
  });

  // @desc    Upload user certificates
  // @route   PUT /api/users/certificates/:id
  // @access  Private/Admin
  router.post(
    "/users/certificates/:id",
    isAuthenticated,
    isAdmin,
    upload.array("certificates", 10),
    async (req, res) => {
      // Get user id
      const userId = req.params.id;

      // Get current user
      const user = await User.findOne({ _id: userId });

      // Check user exists
      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "User not found",
        });
      }

      // Check user type
      if (user.userType !== "Tutor") {
        return res.status(401).json({
          status: "error",
          message: "Only tutor can upload certificates",
        });
      }

      // Find tutor profile
      const tutor = await Tutor.findOne({ userId: userId });

      // Check tutor exists
      if (!tutor) {
        return res.status(404).json({
          status: "error",
          message: "Tutor not found",
        });
      }

      // Get files
      let teachingCertificates = req.files || [];

      // Check files
      if (!teachingCertificates || teachingCertificates.length === 0) {
        return res.status(400).json({
          status: "error",
          message: "No documents",
        });
      }

      teachingCertificates = teachingCertificates.map((file) => {
        return {
          originalname: file.originalname,
          filename: file.filename,
          size: file.size,
          url: `${req.protocol}://${req.get("host")}/api/uploads/certificates/${
            file.filename
          }`,
        };
      });

      //  Update certificates
      tutor.teachingCertificates = teachingCertificates;

      // Save
      await tutor.save();

      return res.status(200).json({
        status: "success",
        message: "Certificates uploaded",
        data: tutor.teachingCertificates,
      });
    }
  );

  // @desc    Delete user certificates
  // @route   PUT /api/users/certificates/:id
  // @access  Private/Admin
  router.delete(
    "/users/certificates/:userId/:id",
    isAuthenticated,
    isAdmin,
    async (req, res) => {
      try {
        const { userId } = req.params;

        // Get current user
        const user = await User.findOne({ _id: userId });

        if (!user) {
          return res.status(404).json({
            status: "error",
            message: "User not found",
          });
        }

        // Check user type
        if (user.userType !== "Tutor") {
          return res.status(401).json({
            status: "error",
            message: "User is not a tutor",
          });
        }

        // Find student profile
        const tutor = await Tutor.findOne({ userId: userId });

        // Check tutor exists
        if (!tutor) {
          return res.status(404).json({
            status: "error",
            message: "Tutor not found",
          });
        }

        // Certificate id
        const certificateId = req.params.id;

        // Get delete certificate
        const deleteCertificate = tutor.teachingCertificates.find(
          (certificate) => certificate["_id"] == certificateId
        );

        if (!deleteCertificate) {
          return res.status(404).json({
            status: "error",
            message: "Certificate not found",
          });
        }

        const certificateDir = path.join(
          __dirname,
          "../../tmp/uploads/certificates/"
        );

        if (fs.existsSync(certificateDir + deleteCertificate.filename)) {
          fs.unlinkSync(certificateDir + deleteCertificate.filename);
        }

        // Delete certificate
        tutor.teachingCertificates = tutor.teachingCertificates.filter(
          (certificate) => certificate["_id"] != certificateId
        );

        // Save
        await tutor.save();

        return res.status(200).json({
          status: "success",
          message: "Certificate removed",
        });
      } catch (err) {
        res.status(400).json({ status: "error", message: err.message });
      }
    }
  );
};

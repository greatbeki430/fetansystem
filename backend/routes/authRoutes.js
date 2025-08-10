const express = require("express");
const router = express.Router();
const {
  signup,
  login,
  // getMe,
  getProfile, // Renamed from getMe
  updateProfile,
  uploadProfilePicture,
} = require("../controllers/authController");
const auth = require("../middlewares/auth");
const upload = require("../middlewares/upload");

router.post("/signup", signup);
router.post("/login", login);
// router.get("/me", auth, getMe);
router.get("/profile", auth, getProfile); // Updated from /me to /profile
// router.put("/profile", auth, updateProfile);
router.put("/profile", auth, upload.single("profilePicture"), updateProfile);
router.post(
  "/profile/picture",
  auth,
  upload.single("profilePicture"),
  uploadProfilePicture
);

module.exports = router;

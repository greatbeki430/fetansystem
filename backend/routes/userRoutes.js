const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const userController = require("../controllers/userController"); // Import the entire controller

router.get("/profile", auth, userController.getProfile);

module.exports = router;

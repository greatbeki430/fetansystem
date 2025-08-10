const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.signup = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    // const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password });
    await user.save();

    res.status(201).json({ message: "User registered successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "User does not exist." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Password mismatch." });
    console.log(password);

    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
        issuer: "Task manager app", // Good practice
        audience: "web", // Helps identify token purpose
      }
    );
    // console.log("Generated token:", token);
    const decoded = jwt.decode(token);
    console.log("Token payload:", decoded);
    console.log("User ID type:", typeof user._id, user._id);
    console.log("JWT_SECRET exists:", !!process.env.JWT_SECRET);
    console.log("Generated token payload:", jwt.decode(token));

    // res.json({ token });
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
    console.error("Login error:", err);
  }
};

// exports.getMe = async (req, res) => {
//   try {
//     const user = await User.findById(req.user.userId).select("name email");
//     if (!user) return res.status(404).json({ message: "User not found" });
//     res.json(user);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

exports.getProfile = async (req, res) => {
  try {
    console.log("Fetching user with ID:", req.user.userId);
    const user = await User.findById(req.user.userId).select(
      "name email profilePicture"
    );
    console.log("Found user:", user);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({
      name: user.name,
      email: user.email,
      profilePicture: user.profilePicture || null,
    });
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body || {}; // Fallback to empty object
    const updates = {};

    if (name && name.trim()) updates.name = name.trim();
    // if (email && email.trim()) updates.email = email.trim();
    if (email && name.trim()) updates.email = email.trim(); // Fixed typo: name.trim() should be email.trim()
    if (req.file) {
      updates.profilePicture = `/uploads/profile-pictures/${req.file.filename}`;
    }

    if (Object.keys(updates).length === 0) {
      return res
        .status(400)
        .json({ message: "No valid fields provided for update" });
    }

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("name email profilePicture");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Profile updated successfully",
      user,
    });
  } catch (err) {
    console.error("Update error:", err);
    res.status(400).json({
      message: err.message || "Failed to update profile",
      error: err.errors,
    });
  }
};

exports.uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { profilePicture: `/uploads/profile-pictures/${req.file.filename}` },
      { new: true }
    ).select("-password");

    res.json({
      message: "Profile picture uploaded successfully",
      user,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

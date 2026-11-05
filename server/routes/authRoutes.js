const express = require("express");
const router = express.Router();

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const authMiddleware = require("../middleware/auth");

// ================= REGISTER API =================

router.post("/register", async (req, res) => {
try {
const { name, username, email, password } = req.body;

// Check required fields
if (!name || !username || !email || !password) {
  return res.status(400).json({
    message: "All fields are required",
  });
}

// Normalize input
const normalizedEmail = email.toLowerCase().trim();
const normalizedUsername = username.trim();

// Check existing user
const existingUser = await User.findOne({
  $or: [
    { email: normalizedEmail },
    { username: normalizedUsername },
  ],
});

if (existingUser) {
  return res.status(409).json({
    message: "Email or username already exists",
  });
}

// Hash password
const hashedPassword = await bcrypt.hash(password, 10);

// Create user
const newUser = await User.create({
  name: name.trim(),
  username: normalizedUsername,
  email: normalizedEmail,
  password: hashedPassword,
});

// Generate token
const token = jwt.sign(
  { userId: newUser._id },
  process.env.JWT_SECRET,
  { expiresIn: "7d" }
);

return res.status(201).json({
  message: "User registered successfully",
  token,
  user: {
    id: newUser._id,
    name: newUser.name,
    username: newUser.username,
    email: newUser.email,
  },
});

} catch (error) {
console.error("Registration Error:", error);

return res.status(500).json({
  message: "Server error during registration",
});

}
});

// ================= LOGIN API =================

router.post("/login", async (req, res) => {
try {
const { email, password } = req.body;

// Check required fields
if (!email || !password) {
  return res.status(400).json({
    message: "Email and password are required",
  });
}

// Find user
const user = await User.findOne({
  email: email.toLowerCase().trim(),
});

if (!user) {
  return res.status(401).json({
    message: "Invalid email or password",
  });
}

// Compare password
const isPasswordCorrect = await bcrypt.compare(
  password,
  user.password
);

if (!isPasswordCorrect) {
  return res.status(401).json({
    message: "Invalid email or password",
  });
}

// Generate token
const token = jwt.sign(
  { userId: user._id },
  process.env.JWT_SECRET,
  { expiresIn: "7d" }
);

return res.status(200).json({
  message: "Login successful",
  token,
  user: {
    id: user._id,
    name: user.name,
    username: user.username,
    email: user.email,
  },
});

} catch (error) {
console.error("Login Error:", error);

return res.status(500).json({
  message: "Server error during login",
});

}
});

// ================= PROTECTED PROFILE API =================

router.get("/profile", authMiddleware, async (req, res) => {
try {
const user = await User.findById(req.userId).select("-password");

if (!user) {
  return res.status(404).json({
    message: "User not found",
  });
}

return res.status(200).json({
  message: "Profile fetched successfully",
  user,
});

} catch (error) {
console.error("Profile Error:", error);

return res.status(500).json({
  message: "Server error",
});

}
});

module.exports = router;  
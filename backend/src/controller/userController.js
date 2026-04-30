const User = require("../models/usermodel");
const asyncHandler = require("../middleware/asyncHandler");

const sendTokenResponse = (user, statusCode, res, message) => {
  const token = user.getSignedJwtToken();
  res.status(statusCode).json({ message, token, user });
};

exports.registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (await User.findOne({ email })) 
    return res.status(400).json({ message: "User already exists" });
  
  const user = await User.create({ name, email, password });
  sendTokenResponse(user, 201, res, "User registered successfully");
});

exports.loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password))) 
    return res.status(400).json({ message: "Invalid credentials" });

  sendTokenResponse(user, 200, res, "Login successful");
});

exports.getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("-password").populate("workspaces");
  res.json(user);
});

exports.updateMe = asyncHandler(async (req, res) => {
  const { name, avatar } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { ...(name && { name }), ...(avatar !== undefined && { avatar }) },
    { new: true }
  ).select("-password");
  res.json({ message: "Profile updated", user });
});

exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword)
    return res.status(400).json({ message: "currentPassword and newPassword are required" });

  const user = await User.findById(req.user.id);
  if (!(await user.matchPassword(currentPassword)))
    return res.status(400).json({ message: "Current password is incorrect" });

  user.password = newPassword;
  await user.save();
  res.json({ message: "Password changed successfully" });
});

exports.getAllUsers = asyncHandler(async (req, res) => {
  res.json(await User.find().select("-password"));
});

exports.inviteUser = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ message: "User found", user });
});

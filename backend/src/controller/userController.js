const User = require("../models/usermodel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const asyncHandler = require("../middleware/asyncHandler");


exports.registerUser =asyncHandler( async (req, res) => {

    const { name, email, password } = req.body;
const existingUser = await User.findOne({ email });

    if (existingUser) {
        return res.status(400).json({
            message: "User already exists"
        });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await User.create({
        name,email,password: hashedPassword
    });

    const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
    res.status(201).json({
        message: "User registered successfully",token,user
    });
});


exports.loginUser =asyncHandler( async (req, res) => {
const { email, password } = req.body;
const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).json({
            message: "Invalid credentials"
        });
    }
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        return res.status(400).json({
            message: "Invalid credentials"
        });
    }
    const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
 res.json({message: "Login successful",token,user});

})

exports.getCurrentUser =asyncHandler (async (req, res) => {
const user = await User.findById(req.user.id).select("-password")
    .populate("workspaces");
res.json(user);
})


exports.getAllUsers =asyncHandler (async (req, res) => {

    const users = await User.find()
    .select("-password");

    res.json(users);
})


exports.inviteUser =asyncHandler( async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json({
            message: "User with this email not found"
        });
    }
    res.json({
        message: "User found",
        user
    });
})

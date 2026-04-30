const express = require("express");
const userRouter = express.Router();

const {registerUser,loginUser,getCurrentUser,getAllUsers,
    inviteUser, updateMe, changePassword} = require("../controller/userController.js");

const authMiddleware = require("../middleware/authMiddleware.js");

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/me", authMiddleware, getCurrentUser);
userRouter.patch("/me", authMiddleware, updateMe);
userRouter.patch("/me/password", authMiddleware, changePassword);
userRouter.get("/", authMiddleware, getAllUsers);
userRouter.post("/invite", authMiddleware, inviteUser);

module.exports = userRouter;
const express = require("express");
const workSpace = express.Router();

const {createWorkspace,getUserWorkspaces,inviteMember,
    removeMember} = require("../controller/workspaceController.js");

const auth = require("../middleware/authMiddleware");
const asyncHandler = require("../middleware/asyncHandler");

workSpace.post("/",auth,asyncHandler(createWorkspace));
workSpace.get("/",auth,asyncHandler(getUserWorkspaces));
workSpace.post("/invite",auth,asyncHandler(inviteMember));
workSpace.post("/remove",auth,asyncHandler(removeMember));

module.exports = workSpace;

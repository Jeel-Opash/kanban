const Workspace = require("../models/workspacemodel.js");
const User = require("../models/usermodel.js");
const asyncHandler = require("../middleware/asyncHandler");


exports.createWorkspace = asyncHandler(async (req, res) => {
    const { name } = req.body;
    const workspace = await Workspace.create({
        name,
        owner: req.user.id,
        members: [
            {user: req.user.id,role: "Owner"}
        ]
    });
    await User.findByIdAndUpdate(req.user.id,{
        $push:{workspaces:workspace._id}
    });
    res.status(201).json({
        message:"Workspace created",
        workspace
    });
});


exports.getUserWorkspaces = asyncHandler(async (req, res) => {
    const workspaces = await Workspace.find({
        "members.user": req.user.id
    }).populate("members.user","name email");
res.json(workspaces);
});


exports.inviteMember = asyncHandler(async (req,res)=>{
    const {workspaceId,email,role} = req.body;
    const user = await User.findOne({email});
    if(!user){
        return res.status(404).json({message:"User not found"});
    }
    const workspace = await Workspace.findById(workspaceId);
    workspace.members.push({
        user:user._id,
        role:role || "Viewer"
    });
    await workspace.save();

    res.json({
        message:"Member invited",
        workspace
    });
});


exports.removeMember = asyncHandler(async (req,res)=>{
    const {workspaceId,userId} = req.body;
    const workspace = await Workspace.findById(workspaceId);
    workspace.members = workspace.members.filter(
        m => m.user.toString() !== userId);
    await workspace.save();
    res.json({message:"Member removed"});
});

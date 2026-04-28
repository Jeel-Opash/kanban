const mongoose = require("mongoose");

const workspaceSchema = new mongoose.Schema(
{
    name: {
        type: String,
        required: true
    },

    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    members: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            },
            role: {
                type: String,
                enum: ["Owner", "Editor", "Viewer"],
                default: "Viewer"
            }
        }
    ]
},
{ timestamps: true }
);

module.exports = mongoose.model("Workspace", workspaceSchema);
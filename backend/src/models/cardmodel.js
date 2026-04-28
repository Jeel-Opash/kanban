const mongoose = require("mongoose");

const cardSchema = new mongoose.Schema(
{
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    column: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Column"
    },
    labels: [{
        type: String
    }],
    assignees: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    dueDate: {
        type: Date
    },

    checklist: [
        {
            text: String,
            completed: Boolean
        }
    ],

    order: {
        type: String
    },

    version: {
        type: Number,
        default: 1
    }
},
{ timestamps: true }
);

module.exports = mongoose.model("Card", cardSchema);
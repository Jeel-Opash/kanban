const mongoose = require("mongoose");

const columnSchema = new mongoose.Schema(
{
    title: {
        type: String,
        required: true
    },

    board: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Board"
    },

    cardIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Card"
    }],

    order: {
        type: String  
    }
},
{ timestamps: true }
);

module.exports = mongoose.model("Column", columnSchema);
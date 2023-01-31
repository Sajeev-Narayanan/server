const mongoose = require("mongoose");

const ChatSchema = new mongoose.Schema(
    {
        members: {
            type: Array,
        },
    },
    {
        timestamps: true,
    }
);

const Chat = mongoose.model("Chat", ChatSchema);
exports.Chat = Chat;

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

exports.ChatModel = mongoose.model("Chat", ChatSchema);
// export default ChatModel;
const { Chat } = require("../model/chatModel");


exports.createChat = async (req, res) => {
    const chats = await Chat.find({ members: [req.body.senderId, req.body.receiverId] })
    if (chats.length < 1) {
        const newChat = new Chat({
            members: [req.body.senderId, req.body.receiverId],
        });
        try {
            const result = await newChat.save();
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json(error);
        }
    } else {
        res.status(200).json(chats);
    }

};

exports.userChats = async (req, res) => {

    try {
        const chat = await Chat.find({
            members: { $in: [req.params.userId] },
        });
        res.status(200).json(chat);
    } catch (error) {
        res.status(500).json(error);
    }
};

exports.findChat = async (req, res) => {
    try {
        const chat = await Chat.findOne({
            members: { $all: [req.params.firstId, req.params.secondId] },
        });
        res.status(200).json(chat)
    } catch (error) {
        res.status(500).json(error)
    }
};
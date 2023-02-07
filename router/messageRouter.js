const express = require("express");
const { addMessage, getMessages } = require("../controller/messageController");
const { authenticateToken } = require("../middleware/userAuth");

const messageRouter = express.Router();

messageRouter.post('/', authenticateToken, addMessage);

messageRouter.get('/:chatId', authenticateToken, getMessages);


module.exports = messageRouter;
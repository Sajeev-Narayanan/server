const express = require("express");
const { createChat, userChats, findChat } = require("../controller/chatController");
const { authenticateToken } = require("../middleware/userAuth");
// const { createChat, findChat, userChats } = require('../controller/chatController');
const chatRouter = express.Router()

chatRouter.post('/', authenticateToken, createChat);
chatRouter.get('/:userId', authenticateToken, userChats);
chatRouter.get('/find/:firstId/:secondId', authenticateToken, findChat);

module.exports = chatRouter;
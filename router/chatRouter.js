const express = require("express");
const { createChat, userChats, findChat } = require("../controller/chatController");
// const { createChat, findChat, userChats } = require('../controller/chatController');
const chatRouter = express.Router()

chatRouter.post('/', createChat);
chatRouter.get('/:userId', userChats);
chatRouter.get('/find/:firstId/:secondId', findChat);

module.exports = chatRouter;
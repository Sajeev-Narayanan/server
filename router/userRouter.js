const express = require("express");
const { check } = require("express-validator");
const userControllers = require("../controller/userController");
const userAuthController = require("../controller/userAuthController");

const userRouter = express.Router();

userRouter.post('/signup', userControllers.signup);
userRouter.post('/otpVerify', userControllers.otpVerify);
userRouter.post('/resendOtp', userControllers.resendOtp);
userRouter.post('/login', userAuthController.login);
userRouter.post('/logout', userAuthController.logout);
userRouter.post('/userToken', userAuthController.userToken);



module.exports = userRouter;
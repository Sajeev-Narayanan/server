const express = require("express");
const { check } = require("express-validator");
const providerControllers = require("../controller/providerController");
const providerAuthController = require("../controller/providerAuthController")

const providerRouter = express.Router();

providerRouter.post("/managerLogin", providerAuthController.login);
providerRouter.post("/signupEmail",providerControllers.signupWithEmail);
providerRouter.post("/otpVerify", providerControllers.otpVerify);
providerRouter.post("/resendOtp", providerControllers.resendOtp);
providerRouter.post("/managersLogout", providerAuthController.logout);
providerRouter.post("/managersToken", providerAuthController.managersToken);

module.exports = providerRouter;
const express = require("express");
const { check } = require("express-validator");
const providerControllers = require("../controller/providerController");
const providerAuthController = require("../controller/providerAuthController");
const { Provider } = require("../model/eventManagerModel");
const { authenticateToken } = require("../middleware/managerAuth");

const providerRouter = express.Router();

providerRouter.post("/managerLogin", providerAuthController.login);
providerRouter.post("/signupEmail", providerControllers.signupWithEmail);
providerRouter.post("/otpVerify", providerControllers.otpVerify);
providerRouter.post("/resendOtp", providerControllers.resendOtp);
providerRouter.post("/managersLogout", providerAuthController.logout);
providerRouter.post("/managersToken", providerAuthController.managersToken);
providerRouter.post("/forgotPassword", providerControllers.forgotPassword);
providerRouter.post("/ChangePasswordOtp", providerControllers.ChangePasswordOtp);
providerRouter.post("/changePassword", providerControllers.changePassword);
providerRouter.post("/providerDetails", authenticateToken, providerControllers.providerDetails);
providerRouter.post("/addService", authenticateToken, providerControllers.addService);
providerRouter.post("/removeService", authenticateToken, providerControllers.removeService);
providerRouter.post("/addimage", authenticateToken, providerControllers.addimage);
providerRouter.post("/removeImage", authenticateToken, providerControllers.removeImage);
providerRouter.route("/editProfile")
    .get(authenticateToken, providerControllers.editProfileGet)
    .put(authenticateToken, providerControllers.editProfilePut);
providerRouter.get("/chatUsers/:id", authenticateToken, providerControllers.chatUsers);
providerRouter.post("/addEstimate", authenticateToken, providerControllers.addEstimate);
providerRouter.get("/estimateDetails/:userId/:managerId", authenticateToken, providerControllers.estimateDetails);
providerRouter.get("/orders/:Id", authenticateToken, providerControllers.orders);
providerRouter.post("/orderDescription", authenticateToken, providerControllers.orderDescription);

module.exports = providerRouter;
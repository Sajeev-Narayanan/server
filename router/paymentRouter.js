const express = require("express");
const { config, createPaymentIntent, paymentDone } = require("../controller/paymentContoller");
const { authenticateToken } = require("../middleware/userAuth");
const paymentRouter = express.Router();

paymentRouter.get("/config", authenticateToken, config);

paymentRouter.post("/createPaymentIntent", authenticateToken, createPaymentIntent);

paymentRouter.get("/paymentDone/:id", authenticateToken, paymentDone)

module.exports = paymentRouter;
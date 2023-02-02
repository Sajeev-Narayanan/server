const express = require("express");
const { config, createPaymentIntent, paymentDone } = require("../controller/paymentContoller");
const paymentRouter = express.Router();

paymentRouter.get("/config", config);

paymentRouter.post("/createPaymentIntent", createPaymentIntent);

paymentRouter.get("/paymentDone/:id", paymentDone)

module.exports = paymentRouter;
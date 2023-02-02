const { Estimate } = require("../model/estimateModel");



const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2022-11-15",
});

exports.config = (req, res) => {
    console.log("payment request kiteee")
    res.send({
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    });
}



exports.createPaymentIntent = async (req, res) => {
    const { payAmount } = req.body
    console.log("{{{{{{payAmount}}}}}}", payAmount)
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            currency: "INR",
            amount: payAmount * 100,
            description: "SprklingStories payment",
            payment_method_types: ["card"],
        });

        // Send publishable key and PaymentIntent details to client
        res.send({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (e) {
        return res.status(400).send({
            error: {
                message: e.message,
            },
        });
    }
}

exports.paymentDone = async (req, res) => {
    const { id } = req.params;
    try {
        await Estimate.findByIdAndUpdate(id, { paid: true })
        res.status(201).json({ message: "success" })
    } catch (error) {
        res.status(500).json({ message: "error" })
    }
}



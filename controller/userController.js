const { User } = require("../model/userModal")

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { response } = require("express");
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const serviceSid = process.env.TWILIO_AUTH_SERVICE_SID;
const client = require("twilio")(accountSid, authToken);

async function sendOtp(mobile) {
    mobile = Number(mobile);
  
    try {
      const verification = await client.verify.v2
        .services(serviceSid)
        .verifications.create({ to: `+91${mobile}`, channel: "sms" });
      return { status: true, verification };
    } catch (error) {
      return { status: false, error };
    }
    console.log("verification", verification);
    return { status: verification.status };
}
  

async function otpVerifyFunction(otp, mobile) {
    const verification_check = await client.verify.v2
      .services(serviceSid)
      .verificationChecks.create({ to: `+91${mobile}`, code: otp });
    console.log("verifcation ckeck otp  ", verification_check.status);
    if (verification_check.status == "approved") {
      return { status: true };
    } else {
      return { status: false };
    }
}
  


const signup = async (req, res) => {
    console.log(req.body)
    const hash = await bcrypt.hash(req.body.password, 5);

    const user = new User({
        email: req.body.email,
        phone: req.body.phone,
        password: hash,
        verified: false,
        approved:false,
    })

    try {
          
        await user.save();
        
        const response = await sendOtp(req.body.phone);
     
    if (response.status === true) {
      res.status(201).json({
        message: `success`,
        otpStatus: `sending to${req.body.phone} `,
      });
    } else {
      res.status(400).json({
        message: `error`,
        otpStatus: `sending to${req.body.phone} `,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "error", error });
  }
}


exports.signup = signup;

const otpVerify = async (req, res) => {
    try {
        const { mobile, otp } = req.body;
        console.log(req.body)

      const response = await otpVerifyFunction(otp, mobile);
      console.log("response of otp", response);
      if (response.status === true) {
        await User.updateOne({ phone:mobile }, { verified: true });
        res.status(201).json({ message: "otp verification successful" });
      } else {
        res.status(400).json({ message: " invalid otp verification " });
      }
    } catch (error) {
      console.log(error);
      res.status(400).json({ message: "otp failed", error: error.massage });
    }
  };
exports.otpVerify = otpVerify;
  

const resendOtp = async (req, res) => {
  console.log(req.body);
  try {
    const { mobile } = req.body;
    const response = await sendOtp(mobile)

    if (response.status === true) {
      res.status(201).json({
        message: `success`,
        otpStatus: `sending to${mobile} `,
      });
    } else {
      res.status(400).json({
        message: `error`,
        otpStatus: `sending to${mobile} `,
      });
    }
  } catch (error) {
    console.log(error);
        res.status(400).json({ message: "error", error });
  }
}
exports.resendOtp = resendOtp;
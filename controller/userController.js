const { User } = require("../model/userModal")

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { response } = require("express");
const Token = require("../model/tokenModal");
const crypto = require("crypto");
const Joi = require("joi");
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const serviceSid = process.env.TWILIO_AUTH_SERVICE_SID;
const client = require("twilio")(accountSid, authToken);


async function sendOtp(mobile) {
  console.log(mobile+"&&&&&&&&")
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
  console.log(otp, mobile+"%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%");
    const verification_check = await client.verify.v2
      .services(serviceSid)
      .verificationChecks.create({ to: `+91${mobile}`, code: otp });
    console.log("verifcation ckeck otp  ", verification_check.status);
  if (verification_check.status == "approved") {
      console.log("&&&&&&&&&&&&&&&&")
      return { status: true };
  } else {
    console.log(":::::::::::::::::::::::::")
      return { status: false };
    }
}

const googleSignup = async (req, res) => {
  console.log(req.body)

  const user = new User({
    email: req.body.email,
    verified: true,
    approved:true,
  })
  try {
    await user.save();
    res.status(200).json({
      message: `success`,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "error", error });
  
  }
}

exports.googleSignup = googleSignup;
  


const signup = async (req, res) => {
    console.log(req.body)
    const hash = await bcrypt.hash(req.body.password, 5);

    const user = new User({
        email: req.body.email,
        phone: req.body.phone,
        password: hash,
        verified: false,
        approved:true,
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

const forgotPassword = async (req, res) => {
  const { mobile } = req.body;
  try {
    const user = await User.findOne({
      phone: req.body.mobile,
      approved: true,
    });
    if (user) {
      console.log("the user need to be forgot password", user);
      const response = await sendOtp(mobile);
      if (response.status === true) {
        res
          .status(201)
          .json(`otp send successfully at to change password ${mobile}`);
      } else {
        res
          .status(500)
          .json(
            `otp failed for network error   at ${mobile} contact developer`
          );
      }
    } else {
      res.status(400).json(`there is no user with mobile number${mobile}`);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json("server addichu poy, call the developer");
  }
};
exports.forgotPassword = forgotPassword;

const ChangePasswordOtp = async (req, res) => {
  try {
    const { mobile, otp } = req.body;
    const response = await otpVerifyFunction(otp, mobile);
    console.log("response of otp", response);
    if (response.status === true) {
      const user = await User.findOne({
        phone: mobile,
        approved: true,
      });
      if (user) {
        let passwordToken = await Token.findOne({ userId: user._id });
        if (!passwordToken) {
          passwordToken = await new Token({
            userId: user._id,
            token: crypto.randomBytes(32).toString("hex"),
          }).save();
        }
        res.status(201).json({
          message: "token and userId  for password change send successfull   ",
          passwordToken: passwordToken.token,
          userId: passwordToken.userId,
        });
      } else {
        res.status(400).json("invalid mobile");
      }
    } else {
      res.status(400).json("invalid otp");
    }
  } catch (error) {
    res.status(500).json("server addichr poy");
  }
};
exports.ChangePasswordOtp = ChangePasswordOtp;

const changePassword = async (req, res) => {
  try {
    const schema = Joi.object({
      password: Joi.string().required(),
      userId: Joi.string().required(),
      passwordToken: Joi.string().required(),
    });
    const { error } = schema.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const { password, userId, passwordToken } = req.body;
    console.log(password);
    console.log(userId);
    console.log(passwordToken);

    const user = await User.findById(userId);
    if (!user)
      return res
        .status(400)
        .send("invalid at userId,  is no user with that userId or expired");
    const token = await Token.findOne({
      userId: userId,
      token: passwordToken,
    });
    if (!token) return res.status(400).send("Invalid link or expired");
    const hash = await bcrypt.hash(password, 5);
    user.password = hash;
    await user.save();
    // await passwordToken.delete();
    res.status(201).json("password changed successfully");
  } catch (error) {
    console.error(error);
    res.status(500).json("server addichu poy, call the developer");
  }
};
exports.changePassword = changePassword;

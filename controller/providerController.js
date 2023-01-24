const { Provider } = require("../model/eventManagerModel")
const  Token  = require("../model/tokenModal")

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const Joi = require("joi");
// const ObjectId = require('mongodb').ObjectId;
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
  console.log("@@@@@@otp@@@@@")
    const verification_check = await client.verify.v2
      .services(serviceSid)
      .verificationChecks.create({ to: `+91${mobile}`, code: otp });
    console.log("verifcation ckeck otp  ", verification_check.status);
  if (verification_check.status == "approved") {
      console.log("---------------")
      return { status: true };
  } else {
    console.log("============")
      return { status: false };
    }
}
  

const signupWithEmail = async (req, res) => {
   
    
  
      const hash = await bcrypt.hash(req.body.providerData.password, 5);
  
      const provider = new Provider({
        companyname: req.body.providerData.companyName,
        description: req.body.providerData.description,
        category: req.body.services,
        place: req.body.place,
        email: req.body.providerData.email,
        mobile: req.body.providerData.phone,
          password: hash,
          certificate:req.body.certificateUrl,
        verified: false,
        approved:false,
      });
        try {
          
            await provider.save();
            
            const response = await sendOtp(req.body.providerData.phone);
         
        if (response.status === true) {
          res.status(201).json({
            message: `success`,
            otpStatus: `sending to${req.body.providerData.phone} `,
          });
        } else {
          res.status(400).json({
            message: `error`,
            otpStatus: `sending to${req.body.providerData.phone} `,
          });
        }
      } catch (error) {
        console.log(error);
        res.status(400).json({ message: "error", error });
      }
    }
//   };
  exports.signupWithEmail = signupWithEmail;

  
const otpVerify = async (req, res) => {
    try {
      const { mobile, otp } = req.body;

      const response = await otpVerifyFunction(otp, mobile);
      console.log("response of otp", response);
      if (response.status === true) {
        await Provider.updateOne({ mobile }, { verified: true });
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
    const provider = await Provider.findOne({
      mobile: req.body.mobile,
      verified: true,
    });
    if (provider) {
      console.log("the user need to be forgot password", provider);
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
      const provider = await Provider.findOne({
        mobile: mobile,
        verified: true,
      });
      console.log(provider)
      if (provider) {
        let passwordToken = await Token.findOne({ userId: provider._id });
        if (!passwordToken) {
          console.log("{{{{{{{{{{object}}}}}}}}}}")
          passwordToken = await new Token({
            userId: provider._id,
            token: crypto.randomBytes(32).toString("hex"),
          }).save();
        }
        res.status(201).json({
          message: "token and userId  for password change send successfull   ",
          passwordToken: passwordToken.token,
          userId: passwordToken.userId,
        });
      } else {
        console.log("[[[[[[[[[[object]]]]]]]]]]")
        res.status(400).json("invalid mobile");
      }
    } else {
      console.log("??????????????????????")
      res.status(400).json("invalid otp");
    }
  } catch (error) {
    console.log("/////////////////////")
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
    // console.log(password);
    // console.log(userId);
    // console.log(passwordToken);
    // console.log("mayiru")
    // const id = new ObjectId(userId);
    // console.log(id)

    const provider = await Provider.findById(userId);
    if (!provider)
      return res
        .status(400)
        .send("invalid at userId,  is no user with that userId or expired");
    const token = await Token.findOne({
      userId: userId,
      token: passwordToken,
    });
    console.log("<<<<<<<<<<"+token)
    if (!token) return res.status(400).send("Invalid link or expired");
    const hash = await bcrypt.hash(password, 5);
    provider.password = hash;
    await provider.save();
    // await passwordToken.delete();
    res.status(201).json("password changed successfully");
  } catch (error) {
    console.error(error);
    res.status(500).json("server addichu poy, call the developer");
  }
};
exports.changePassword = changePassword;

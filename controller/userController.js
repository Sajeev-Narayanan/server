const { User } = require("../model/userModal")

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { response } = require("express");
const Token = require("../model/tokenModal");
const crypto = require("crypto");
const Joi = require("joi");
const { Provider } = require("../model/eventManagerModel");
const { Estimate } = require("../model/estimateModel");
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
  return { status: verification.status };
}


async function otpVerifyFunction(otp, mobile) {
  const verification_check = await client.verify.v2
    .services(serviceSid)
    .verificationChecks.create({ to: `+91${mobile}`, code: otp });
  if (verification_check.status == "approved") {
    return { status: true };
  } else {
    return { status: false };
  }
}

const googleSignup = async (req, res) => {


  const user = new User({
    email: req.body.email,
    verified: true,
    approved: true,
  })
  try {
    await user.save();
    res.status(200).json({
      message: `success`,
    });
  } catch (error) {
    res.status(400).json({ message: "error", error });

  }
}

exports.googleSignup = googleSignup;



const signup = async (req, res) => {
  const hash = await bcrypt.hash(req.body.password, 5);

  const user = new User({
    email: req.body.email,
    phone: req.body.phone,
    password: hash,
    verified: false,
    approved: true,
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
    res.status(400).json({ message: "error", error });
  }
}


exports.signup = signup;

const otpVerify = async (req, res) => {
  try {
    const { mobile, otp } = req.body;

    const response = await otpVerifyFunction(otp, mobile);
    if (response.status === true) {
      await User.updateOne({ phone: mobile }, { verified: true });
      res.status(201).json({ message: "otp verification successful" });
    } else {
      res.status(400).json({ message: " invalid otp verification " });
    }
  } catch (error) {
    res.status(400).json({ message: "otp failed", error: error.massage });
  }
};
exports.otpVerify = otpVerify;


const resendOtp = async (req, res) => {
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
    res.status(500).json("server addichu poy, call the developer");
  }
};
exports.forgotPassword = forgotPassword;

const ChangePasswordOtp = async (req, res) => {
  try {
    const { mobile, otp } = req.body;
    const response = await otpVerifyFunction(otp, mobile);
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
    res.status(201).json("password changed successfully");
  } catch (error) {
    res.status(500).json("server addichu poy, call the developer");
  }
};
exports.changePassword = changePassword;

const findManagers = async (req, res) => {
  const { service, place } = req.query;

  try {
    const response = await Provider.find({ category: service, place: place })
    res.status(201).json(response)
  } catch (error) {
    res.status(500).json({ message: error })
  }
}
exports.findManagers = findManagers;

const managerProfile = async (req, res) => {
  const id = req.query.id;

  try {
    const response = await Provider.findById(id)
    res.status(201).json(response)

  } catch (error) {
    res.status(500).json({ message: error })
  }
}
exports.managerProfile = managerProfile;

const chatManagers = async (req, res) => {
  try {
    const data = await Provider.findById({
      _id: mongoose.Types.ObjectId(req.params.id),
    });
    res.status(200).json(data);
  } catch (err) {
    res.status(404);
  }
};
exports.chatManagers = chatManagers;

const estimateData = async (req, res) => {
  const { userId, managerId } = req.body;
  try {
    const data = await Estimate.find({ userId: mongoose.Types.ObjectId(userId), managerId: mongoose.Types.ObjectId(managerId) })

    if (data != null) {
      res.status(201).json(data)
    } else {
      res.json({
        message: "error"
      })
    }

  } catch (error) {
    res.status(500).json({ message: error })
  }
}
exports.estimateData = estimateData;

const orders = async (req, res) => {
  const { Id } = req.params;
  try {
    const result = await Estimate.find({ userId: Id })
    res.status(201).json(result)
  } catch (error) {
    res.status(500).json(error)
  }
}
exports.orders = orders;
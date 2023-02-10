const { Provider } = require("../model/eventManagerModel")
const Token = require("../model/tokenModal")

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const Joi = require("joi");
// const ObjectId = require('mongodb').ObjectId;
const { response } = require("express");
const { User } = require("../model/userModal");
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
    certificate: req.body.certificateUrl,
    verified: false,
    approved: false,
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
    res.status(400).json({ message: "error", error });
  }
}
//   };
exports.signupWithEmail = signupWithEmail;


const otpVerify = async (req, res) => {
  try {
    const { mobile, otp } = req.body;

    const response = await otpVerifyFunction(otp, mobile);
    if (response.status === true) {
      await Provider.updateOne({ mobile }, { verified: true });
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
    const provider = await Provider.findOne({
      mobile: req.body.mobile,
      verified: true,
    });
    if (provider) {
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
    res.status(500).json("server problem");
  }
};
exports.forgotPassword = forgotPassword;

const ChangePasswordOtp = async (req, res) => {
  try {
    const { mobile, otp } = req.body;
    const response = await otpVerifyFunction(otp, mobile);


    if (response.status === true) {
      const provider = await Provider.findOne({
        mobile: mobile,
        verified: true,
      });
      if (provider) {
        let passwordToken = await Token.findOne({ userId: provider._id });
        if (!passwordToken) {
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


    const provider = await Provider.findById(userId);
    if (!provider)
      return res
        .status(400)
        .send("invalid at userId,  is no user with that userId or expired");
    const token = await Token.findOne({
      userId: userId,
      token: passwordToken,
    });
    if (!token) return res.status(400).send("Invalid link or expired");
    const hash = await bcrypt.hash(password, 5);
    provider.password = hash;
    await provider.save();
    res.status(201).json("password changed successfully");
  } catch (error) {
    res.status(500).json("server addichu poy, call the developer");
  }
};
exports.changePassword = changePassword;


const providerDetails = async (req, res) => {

  try {
    const provider = await Provider.findOne({ email: req.body.email });
    res.status(200).json({ data: provider });
  } catch (error) {
    res.status(500).json({ message: error });
  }
}
exports.providerDetails = providerDetails;

const addService = async (req, res) => {
  const { data, managers } = req.body;

  if (data && managers) {
    try {
      await Provider.findOneAndUpdate({ email: managers }, { $push: { category: data } })
      res.status(201).json({ message: "success" })
    } catch (error) {
      res.status(500).json({ message: error })
    }
  } else { res.status(500).json({ message: "error" }) }
}
exports.addService = addService;

const removeService = async (req, res) => {
  const { data, managers } = req.body;

  if (data && managers) {
    try {
      await Provider.findOneAndUpdate({ email: managers }, { $pull: { category: data } })
      res.status(201).json({ message: "success" })
    } catch (error) {
      res.status(500).json({ message: error })
    }
  } else { res.status(500).json({ message: "error" }) }
}
exports.removeService = removeService;

const addimage = async (req, res) => {
  const { imageUrl, managers } = req.body;

  if (imageUrl, managers) {
    try {
      const result = await Provider.findOneAndUpdate({ email: managers }, { $push: { gallery: imageUrl } })

      res.status(201).json({ message: "success" })
    } catch (error) {
      res.status(500).json({ message: error })
    }
  } else { res.status(500).json({ message: "error" }) }
}
exports.addimage = addimage;

const removeImage = async (req, res) => {
  const { imageUrl, managers } = req.body;
  if (imageUrl, managers) {
    try {
      const result = await Provider.findOneAndUpdate({ email: managers }, { $pull: { gallery: imageUrl } })

      res.status(201).json({ message: "success" })
    } catch (error) {
      res.status(500).json({ message: error })
    }
  } else { res.status(500).json({ message: "error" }) }
}
exports.removeImage = removeImage;

const editProfileGet = async (req, res) => {
  const email = req.query.managers;
  try {
    const profile = await Provider.findOne({ email: email });
    profile ?
      res.status(201).json({ profile }) :
      res.status(500).json({ message: "error" })
  } catch (error) {
    res.status(500).json({ message: "error" })
  }

}
exports.editProfileGet = editProfileGet;

const editProfilePut = async (req, res) => {
  const { email, name, description, place } = req.body
  if (req.body.coverPhotoUrl && req.body.profilePhotoUrl) {
    try {
      await Provider.findOneAndUpdate(email, { companyname: name, description: description, place: place, coverPhoto: req.body.coverPhotoUrl, profilePhoto: req.body.profilePhotoUrl })
      res.status(201).json({ message: "success" })
    } catch (error) {
      res.status(500).json({ message: error })
    }
  } else {
    try {
      await Provider.findOneAndUpdate(email, { companyname: name, description: description, place: place, coverPhoto: "", profilePhoto: "" })
      res.status(201).json({ message: "success" })
    } catch (error) {
      res.status(500).json({ message: error })
    }
  }
}
exports.editProfilePut = editProfilePut

const chatUsers = async (req, res) => {
  try {
    const data = await User.findById({
      _id: mongoose.Types.ObjectId(req.params.id),
    });
    res.status(200).json(data);
  } catch (err) {
    res.status(404);
  }
};
exports.chatUsers = chatUsers;

const addEstimate = async (req, res) => {
  const { userId, managerId, estimate } = req.body;
  const estimates = new Estimate({
    userId, managerId, estimate
  })
  try {
    await estimates.save()
    res.status(201).json({ message: "success" })

  } catch (error) {
    res.status(500).json({ message: "success" })
  }
}
exports.addEstimate = addEstimate;
const estimateDetails = async (req, res) => {
  const { userId, managerId } = req.params;
  try {
    const result = await Estimate.find({ userId, managerId })
    res.status(201).json(result)
  } catch (error) {
    res.status(500).json(error);
  }
}
exports.estimateDetails = estimateDetails;

const orders = async (req, res) => {
  const { Id } = req.params;
  try {
    const result = await Estimate.find({ managerId: Id })
    res.status(201).json(result)
  } catch (error) {
    res.status(500).json(error)
  }
}
exports.orders = orders

const orderDescription = async (req, res) => {
  const { description, id } = req.body;
  try {
    const result = await Estimate.findByIdAndUpdate(id, { description: description })
    result.description = description
    res.status(201).json(result)
  } catch (error) {
    res.status(500).json(error)
  }
}

exports.orderDescription = orderDescription
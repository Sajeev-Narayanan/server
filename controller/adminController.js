const { Provider } = require("../model/eventManagerModel")
const { Admin } = require("../model/adminModel")


const mongoose = require("mongoose");
const { response } = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { User } = require("../model/userModal");

const addAdmin = async (req, res) => {
  console.log(req.body);
  const hash = await bcrypt.hash(req.body.password, 5);

  const admin = new Admin({
    name: req.body.name,
    password: hash,
  })
  try {
    await admin.save();
  } catch (error) {
    console.log(error)
  }
}


// const adminLogin = (req, res) => { 
//     console.log(req.body);
//     const { name, password } = req.body;

//     const admin = process.env.ADMIN_ID;
//     const adPassword = process.env.ADMIN_PASSWORD

//   if (name === admin && password === adPassword) {
//     const user = { name: "admin" }
//     const accessToken = jwt.sign(user,process.env.ADMIN_ACCESS_SECRET)
//         res.status(201).json({
//           message: `success`,
//           accessToken : accessToken,
//           });
//     }else {
//         res.status(400).json({
//           message: `error`,
//         });
//       }
// }


const userData = async (req, res) => {
  // if (req.user == "admin") {
    try {
      const managers = await User.find({ verified: true })
      console.log(managers)
      if (managers) {
        res.status(200).json({
          message: 'success',
          data: managers,
        })
      }  else {
        res.status(400).json({
          message: 'error',
        })
      }
    } catch (error) {
      res.status(400).json({
        message: 'error',
      })
    }
  // } else if (req.user == "expired") {
  //   console.log("yes%%")
  //   res.status(200).json({
  //     message: 'expired',
  //   })
  // }
}

const managerData = async (req, res) => {
  // if (req.user == "admin") {
    try {
      const managers = await Provider.find({ approved: false })
      // console.log(managers)
      if (managers) {
        res.status(200).json({
          message: 'success',
          data: managers,
        })
      }  else {
        res.status(400).json({
          message: 'error',
        })
      }
    } catch (error) {
      res.status(400).json({
        message: 'error',
      })
    }
  // } else if (req.user == "expired") {
  //   console.log("yes%%")
  //   res.status(200).json({
  //     message: 'expired',
  //   })
  // }
}

const aprovedManagers = async (req, res) => { 
  
  try {
    const managers = await Provider.find({approved: true})
    console.log(managers)
    if (managers) {
      res.status(200).json({
        message: 'success',
        data: managers,
      })
    } else {
      res.status(400).json({
        message: 'error',
      })
    }
  } catch (error) {
    res.status(400).json({
      message: 'error',
    })
  }
}

const approve = async (req, res) => { 
  const { id } = req.body;
  try {
    await Provider.findByIdAndUpdate(id, { approved: true });
    res.status(200).json({
      message: 'success',
    })
  } catch (error) {
    res.status(400).json({
      message: 'error',
    })
  }
}

const reject = async (req, res) => { 
  const { id } = req.body;
  try {
    await Provider.findByIdAndDelete(id);
    res.status(200).json({
      message: 'success',
    })
  } catch (error) {
    res.status(400).json({
      message: 'error',
    })
  }
}

const blockManagers = async (req, res) => {
  const { id } = req.body;
  try {
    await Provider.findByIdAndUpdate(id, { verified: false });
    res.status(200).json({
      message: 'success',
    })
  } catch (error) {
    res.status(400).json({
      message: 'error',
    })
  }
}
const unblockManagers = async (req, res) => {
  const { id } = req.body;
  try {
    await Provider.findByIdAndUpdate(id, { verified: true });
    res.status(200).json({
      message: 'success',
    })
  } catch (error) {
    res.status(400).json({
      message: 'error',
    })
  }
}



exports.addAdmin = addAdmin;
// exports.adminLogin = adminLogin;
exports.userData = userData;
exports.managerData = managerData;
exports.aprovedManagers = aprovedManagers;
exports.approve = approve;
exports.reject = reject;
exports.blockManagers = blockManagers;
exports.unblockManagers = unblockManagers;
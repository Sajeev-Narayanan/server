const { Provider } = require("../model/eventManagerModel")
const { Admin } = require("../model/adminModel")


const mongoose = require("mongoose");
const { response } = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { User } = require("../model/userModal");
const { Estimate } = require("../model/estimateModel");

const addAdmin = async (req, res) => {
  const hash = await bcrypt.hash(req.body.password, 5);

  const admin = new Admin({
    name: req.body.name,
    password: hash,
  })
  try {
    await admin.save();
    res.status(200);
  } catch (error) {
    res.status(500);
  }
}



const userData = async (req, res) => {

  try {
    const managers = await User.find({ verified: true })
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

const managerData = async (req, res) => {

  try {
    const managers = await Provider.find({ approved: false })

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
      message: 'error'
    })
  }
}

const aprovedManagers = async (req, res) => {

  try {
    const managers = await Provider.find({ approved: true })
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

const blockUser = async (req, res) => {
  const { id } = req.body;
  try {
    await User.findByIdAndUpdate(id, { approved: false });
    res.status(200).json({
      message: 'success',
    })
  } catch (error) {
    res.status(400).json({
      message: 'error',
    })
  }
}

const unblockUser = async (req, res) => {
  const { id } = req.body;
  try {
    await User.findByIdAndUpdate(id, { approved: true });
    res.status(200).json({
      message: 'success',
    })
  } catch (error) {
    res.status(400).json({
      message: 'error',
    })
  }
}

const transactions = async (req, res) => {
  try {
    const result = await Estimate.find({ paid: true })
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json(error);
  }
}


const dashboard = async (req, res) => {
  try {
    const users = await User.count();
    const managers = await Provider.count();
    const transactions = await Estimate.count({ paid: true });
    const graphData = {
      "chart": {
        "caption": "DASHBOARD",
        "yAxisName": "Count",
        // "theme": "fusion"
      },
      "data": [
        {
          "label": "No.Users",
          "value": users
        },
        {
          "label": "No.Managers",
          "value": managers
        },
        {
          "label": "No.Transactions",
          "value": transactions
        },
      ]
    };
    res.status(201).json(graphData)

  } catch (error) {
    response.status(500).json(error)
  }


}





exports.addAdmin = addAdmin;
exports.userData = userData;
exports.managerData = managerData;
exports.aprovedManagers = aprovedManagers;
exports.approve = approve;
exports.reject = reject;
exports.blockManagers = blockManagers;
exports.unblockManagers = unblockManagers;
exports.blockUser = blockUser;
exports.unblockUser = unblockUser;
exports.transactions = transactions
exports.dashboard = dashboard
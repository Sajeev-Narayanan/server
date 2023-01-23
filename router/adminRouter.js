const express = require("express");
const { check } = require("express-validator");
const adminControllers = require("../controller/adminController");
const adAuthController = require("../controller/adminAuthController");
const adminAuth = require("../middleware/adminAuth")
const adminRouter = express.Router();

adminRouter.post('/addAdmin', adminControllers.addAdmin);
// adminRouter.post("/adminLogin", adminControllers.adminLogin);
adminRouter.get('/userData', adminControllers.userData);
adminRouter.get("/managerData", adminControllers.managerData);
adminRouter.get("/aprovedManagers", adminControllers.aprovedManagers);
adminRouter.post("/approve", adminControllers.approve);
adminRouter.post("/reject", adminControllers.reject);
adminRouter.post("/blockManagers", adminControllers.blockManagers);
adminRouter.post("/unblockManagers", adminControllers.unblockManagers);
adminRouter.post("/blockUser", adminControllers.blockUser);
adminRouter.post("/unblockUser", adminControllers.unblockUser);
adminRouter.post("/token", adAuthController.token);
adminRouter.post("/adminLogout", adAuthController.adminLogout);
adminRouter.post("/adminLogin", adAuthController.adminLogin);

module.exports = adminRouter;
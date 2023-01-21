const mongoose = require("mongoose");


const schema = mongoose.Schema;

const adminSchema = new schema(
  {
        name: { type: String, required: true, trim: true },
        password: { type: String, required: true, trim: true },
        refreshToken: [String],
  },
  { timestamps: true }
);

const Admin = mongoose.model("Admin", adminSchema);
exports.Admin = Admin;
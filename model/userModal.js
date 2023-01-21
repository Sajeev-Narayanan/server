const mongoose = require("mongoose");


const schema = mongoose.Schema;

const userSchema = new schema(
  {
        email: { type: String, required: true, trim: true },
        phone: { type: Number, trim: true },
        password: { type: String, trim: true },
        refreshToken: [String],
        verified: { type: Boolean },
        approved:{type:Boolean},
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
exports.User = User;
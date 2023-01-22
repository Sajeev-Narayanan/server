

const mongoose = require("mongoose");
const Joi = require("joi");

// const passportLocalMongoose=require("passport-local-mongoose")

const schema = mongoose.Schema;

const providerSchema = new schema(
  {
        email: { type: String, required: true, trim: true },
        companyname: { type: String, required: true },
        description: { type: String, required: true, trim: true },
        category: { type: Array, required: true, trim: true },
        place: { type: Array, required: true, trim: true },
        mobile: { type: Number, trim: true ,required:true},
        verified: { type: Boolean },
        approved: { type: Boolean },
        password: { type: String, trim: true,required:true },
        certificate: { type: String, required: true, trim: true },
        refreshToken: [String],
  },
  { timestamps: true }
);



const Provider = mongoose.model("Provider", providerSchema);
exports.Provider = Provider;
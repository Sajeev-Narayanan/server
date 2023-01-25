

const mongoose = require("mongoose");
const Joi = require("joi");

// const passportLocalMongoose=require("passport-local-mongoose")

const schema = mongoose.Schema;

const providerSchema = new schema(
  {
        email: { type: String,unique: true, required: true, trim: true },
        companyname: { type: String, required: true },
        description: { type: String, required: true, trim: true },
        category: { type: Array,unique: true, required: true, trim: true },
        place: { type: Array,unique: true, required: true, trim: true },
        mobile: { type: Number,unique: true, trim: true ,required:true},
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
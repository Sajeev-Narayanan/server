

const mongoose = require("mongoose");
const Joi = require("joi");

// const passportLocalMongoose=require("passport-local-mongoose")

const schema = mongoose.Schema;

const providerSchema = new schema(
  {
        email: { type: String, required: true, trim: true },
        companyname: { type: String, required: true },
        description: { type: String, required: true, trim: true },
        category: { type: String, required: true, trim: true },
        place: { type: String, required: true, trim: true },
        mobile: { type: Number, trim: true ,required:true},
        verified: { type: Boolean },
        approved: { type: Boolean },
        password: { type: String, trim: true,required:true },
        certificate: { type: String, required: true, trim: true },
        refreshToken: [String],
  },
  { timestamps: true }
);

function validateProvider(provider) {
  const schema = Joi.object({
    name: Joi.string()
      .regex(/^[a-zA-Z0-9 ,.'-]+$/)
      .min(5)
      .max(50)
      .required(),
    email: Joi.string().email().min(5).max(255).required(),
    password: Joi.string().min(8).max(255).required(),
    mobile: Joi.string()
      .regex(/^[0-9]+$/)
      .min(10)
      .max(10)
      .required(),
  });
  let result = schema.validate(provider);
  //   if (!result["error"]) result = validatePassword(user.password);

  return result;
}

const Provider = mongoose.model("Provider", providerSchema);
exports.Provider = Provider;
exports.validate = validateProvider;
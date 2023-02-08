if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const mongoose = require("mongoose");

mongoose.set('strictQuery', false);
const dbconfig = async () => {
  try {
    await mongoose.connect(process.env.mongoConnect, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("CONNECTED 👍");
  } catch (error) {
    console.log("OH NO MONGO CONNECTION ERROR!!!!");
    console.log(error);
    process.exit();
  }
};
module.exports = dbconfig;
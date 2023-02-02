if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}



const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
const dbconfig = require("./config/dbConfig");


const userRoutes = require("./router/userRouter");
const providerRoutes = require("./router/providerRouter");
const adminRoutes = require("./router/adminRouter");
const chatRoutes = require("./router/chatRouter");
const messageRoutes = require("./router/messageRouter");
const paymentRouter = require("./router/paymentRouter");

// ****************************************************
const app = express();
// ****************************************************

app.use(cors());

dbconfig();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));



app.use(function (req, res, next) {
  res.set(
    "Cache-Control",
    "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0"
  );
  next();
});

app.use((req, res, next) => {
  res.setHeader("Access-Contol-Allow-Orgin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
  next();
});


app.use("/", userRoutes);
app.use("/provider", providerRoutes)
app.use("/admin", adminRoutes);
app.use("/chat", chatRoutes);
app.use("/message", messageRoutes);
app.use("/payment", paymentRouter)



// app.get("*", (req, res, next) => {
//     res.send("ALL DONE 😍👍");
//   });




app.listen(8000, () => {
  console.log("listening to port 8000 .@@@@@@@👌😍👍😁");
});
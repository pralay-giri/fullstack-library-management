const mongoose = require("mongoose")
require("dotenv").config()
const uri = process.env.MONGODB_URI

mongoose.connect(uri)
    .then(() => {
        console.log("mongodb connection successfull...");
    }).catch((error) => {
        console.log("error in connecting!! \n Error: " + error);
    });
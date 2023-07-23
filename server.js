const express = require("express");
const app = express();
require("./connection/connect")
const bodyParser = require("body-parser");
const path = require("path");
const route = require("./routes/route");
require("dotenv").config();
const port = process.env.PORT || 5500;
const staticFilePath = path.join(__dirname, "./public");

app.set("view engine", "ejs");
app.use(express.static(staticFilePath));
app.use("/addBook", express.static(staticFilePath));
app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use("/", route);

app.listen(port,()=>{
    console.log(`server listen on http://localhost:${port}`);
});
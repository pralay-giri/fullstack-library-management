const mongoose = require("mongoose");
const validation = require("validator");

const books_model = mongoose.Schema({
    photo: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        unique: true,
        required: true,
    },
    author: {
        type: String,
        required: true,
    },
    publish_time:{
        type: String,
        required: true
    },
    stock: {
        type: Number,
        required: true
    }
},{
    versionKey: false
}
);

const BOOK_MODEL = mongoose.model("BOOK_MODEL", books_model);

module.exports = BOOK_MODEL
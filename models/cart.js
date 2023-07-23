const mongoose = require("mongoose");

const cart_schema = mongoose.Schema({
    student_id: {
        type: Object,
        required: true
    },
    book_id: {
        type: Object,
        required: true
    }
}, {
    versionKey: false
});

const CART_MODEL = mongoose.model("CART_MODEL", cart_schema);

module.exports = CART_MODEL;
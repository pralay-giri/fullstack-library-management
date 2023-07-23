const mongoose = require("mongoose");
const validation = require("validator");
const bcrypt = require("bcrypt")

const users_model = mongoose.Schema({
    profile_photo: {
        type: String,
        trim: true,
        default: "PG_3.png",
    },
    first_name: {
        type: String,
        required: true,
        trim: true,
        uppercase: true,
        minLength: [2, "first name should be beteeen 2 - 30"],
        maxLength: [30, "first name should be beteeen 2 - 30"],
        validate: {
            validator: value => { validation.isAlpha(value) },
            message: "name contains only leters"
        }
    },
    last_name: {
        type: String,
        required: true,
        trim: true,
        uppercase: true,
        minLength: [2, "last name should be beteeen 2 - 30"],
        maxLength: [30, "last name should be beteeen 2 - 30"],
        validate: {
            validator: value => { validation.isAlpha(value) },
            message: "name contains only leters"
        }
    },
    gender: {
        type: String,
        required: true,
    },
    about: {
        type: String,
        trim: true,
        uppercase: true,
        min: [5, "about length atlest contains 5 charachter"],
        default: null
    },
    gmail: {
        type: String,
        required: true,
        unique: [true, "allready used gmail"],
        validate: {
            validator: value => { validation.isEmail(value) },
            message: "not a valid gmail"
        }
    },
    phone_no: {
        type: Number,
        required: true,
        validate: {
            validator: value => { value.toString().length >= 10 },
            message: "not valid phone number"
        }
    },
    city: {
        type: String,
        required: true,
    },
    postal: {
        type: String,
        required: true,
        minLength: [6, "postal code length must be 6"],
    },
    state: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
        minLength: [8, "minimum length of password is 8"],
        maxLength: [16, "minmum length of password is 16"],
        validate: {
            validator: value => { validation.isAlphanumeric(value) },
            message: "password contains only character and number"
        }
    },
    role: {
        type: String,
        uppercase: true,
        default: "STUDENT",
        validate: {
            validator: value => { value === "ADMIN" || value === "STUDENT" },
            message: "two role ADMIN and STUDENT"
        }
    }
}, {
    versionKey: false
});

users_model.pre("save", async function(next){
    try {
        if(this.isModified("password")){
            const salt = await bcrypt.genSalt(12);
            const hashedPassword = await bcrypt.hash(this.password, salt);
            this.password = hashedPassword;
        }
        next();
    } catch (error) {
        next(error);
    };
});

const USER_MODEL = mongoose.model("USER_MODEL", users_model);

module.exports = USER_MODEL
/*
    ######################
        Table of content
    ######################
    1. default route
    2. details
    3. cart
    4. add to cart
    5. profile
    6. books
    7. sign in
    8. log in
    9. log out
    10. add book
    11. delete book
    12. authntication
    13. search books
    14. give_back
*/


const express = require("express");
const router = express.Router();
const multer = require("multer");
const USER_MODEL = require("../models/users");
const BOOK_MODEL = require("../models/books");
const CART_MODEL = require("../models/cart");
const bcrypt = require("bcrypt");
const session = require("express-session");
const mongooSession = require("connect-mongodb-session")(session);
require("dotenv").config();
const add_book_route = require("./addBookRoute");
const path = require("path");
const fs = require("fs");
const { ObjectId } = require("bson");

const uri = process.env.MONGODB_URI
const secret = process.env.SECRET_KEY


const storage = multer.diskStorage({
    destination: "./public/profiles",
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname);
    }
});

const upload = multer({ storage });

const store = new mongooSession({
    uri,
    collection: "userSession"
});

router.use(session({
    secret,
    resave: false,
    saveUninitialized: false,
    store,
    cookie: {
        httpOnly: true,
        secure: false,
        maxAge: 86400000
    }
}));


/*
    #############
    default route
    #############
*/
router.get("/", (req, res) => {
    const profile_photo = req.session.user ? `./profiles/${req.session.user.profile_photo}` : "./media/PG_3.png";
    const nav_bar_by_role = req.session.user ? (req.session.user.role === "ADMIN" ? "admin_nav" : "navigation") : "navigation";
    return res.render("index", {
        title: "Home",
        navigation_bar: nav_bar_by_role,
        profile_photo
    });
});


/*
    #######
    details
    #######
*/
router.get("/details", isAuth, (req, res) => {
    const profile_photo = req.session.user ? `./profiles/${req.session.user.profile_photo}` : "./media/PG_3.png";
    const nav_bar_by_role = req.session.user ? (req.session.user.role === "ADMIN" ? "admin_nav" : "navigation") : "navigation";
    return res.render("details", { title: "Book details", profile_photo, navigation_bar: nav_bar_by_role });
});


/*
    ####
    cart
    ####
*/
router.get("/cart", isAuth, async (req, res) => {
    const profile_photo = req.session.user ? `./profiles/${req.session.user.profile_photo}` : "./media/PG_3.png";
    const nav_bar_by_role = req.session.user ? (req.session.user.role === "ADMIN" ? "admin_nav" : "navigation") : "navigation";
    try {
        const student_id = new ObjectId(req.session.user._id);
        const cartItems = await CART_MODEL.find({ student_id });

        const allbBooks = [];
        for (let i = 0; i < cartItems.length; i++) {
            let book = await BOOK_MODEL.findOne({ _id: new ObjectId(cartItems[i].book_id) });
            allbBooks.push(book);
        }

        return res.render("cart", { title: "Cart", profile_photo, navigation_bar: nav_bar_by_role, allbBooks });
    } catch (error) {
        console.log(error);
        return res.render("404", { title: "201", profile_photo, navigation_bar: nav_bar_by_role, responce_code: 201, error: "did not have any book" });
    }
});


/*
    ###########
    add to cart
    ###########
*/

router.post("/add_to_cart", isAuth, async (req, res) => {
    try {
        const book_name = req.body.book_name;
        const book = await BOOK_MODEL.findOne({ name: book_name });

        if (!book || book.stock <= 0) {
            throw new Error("not available");
        }

        const book_id = new ObjectId(book._id);
        const student_id = new ObjectId(req.session.user._id);

        const isBookInCart = await CART_MODEL.findOne({ student_id, book_id });
        if (isBookInCart) {
            throw new Error("allready in cart");
        }

        const cart = CART_MODEL({ student_id, book_id });
        await cart.save();

        await BOOK_MODEL.updateOne(
            { _id: book._id },
            { $inc: { stock: -1 } }
        );

        res.send({ status: true });
    } catch (error) {
        res.send({ status: false, error });
    }
})

/*
    #######
    profile
    #######
*/
router.get("/profile", isAuth, (req, res) => {
    const user = req.session.user;
    const profile_photo = req.session.user ? `./profiles/${req.session.user.profile_photo}` : "./media/PG_3.png";
    const nav_bar_by_role = req.session.user ? (req.session.user.role === "ADMIN" ? "admin_nav" : "navigation") : "navigation";
    res.render("profile", {
        profile_photo,
        title: "profile",
        css_file: "profile.css",
        navigation_bar: nav_bar_by_role,
        name: `${user.first_name} ${user.first_name}`,
        role: user.role,
        about: user.about,
        gmail: user.gmail,
        phone_no: user.phone_no,
        city: user.city,
        state: user.state,
        postal_code: user.postal
    });
});


/*
    #####
    books
    #####
*/
router.get("/books", isAuth, async (req, res) => {
    const nav_bar_by_role = req.session.user ? (req.session.user.role === "ADMIN" ? "admin_nav" : "navigation") : "navigation";
    const profile_photo = req.session.user ? `./profiles/${req.session.user.profile_photo}` : "./media/PG_3.png";
    try {
        let user = "";
        if (req.session.user) {
            if (req.session.user.role === "ADMIN") {
                user = "ADMIN";
            }
            else {
                user = "STUDENT";
            }
        }
        const books = await BOOK_MODEL.find({});
        return res.render("all_books", { user: req.session.user.role, title: "Books", books, profile_photo, navigation_bar: nav_bar_by_role });
    } catch (error) {
        return res.render("404", { title: "Error", profile_photo, navigation_bar: nav_bar_by_role, responce_code: 202, error: err });
    }
});


/*
    #######
    sign in 
    #######
*/
router.route("/signin")
    .get((req, res) => {
        const profile_photo = req.session.user ? `./profiles/${req.session.user.profile_photo}` : "./media/PG_3.png";
        const nav_bar_by_role = req.session.user ? (req.session.user.role === "ADMIN" ? "admin_nav" : "navigation") : "navigation";
        return res.render("signin", { title: "Sign in", profile_photo, navigation_bar: nav_bar_by_role });
    })
    .post(upload.single("profile_photo"), async (req, res) => {
        try {
            const filename = {
                profile_photo: req.file.filename
            }
            const newUSer = USER_MODEL({ ...filename, ...req.body });
            const responceFromDb = await newUSer.save();
            if (responceFromDb) {
                return res.redirect("/login");
            }
        } catch (error) {
            let error_msg = [];
            for (let key in error.errors) {
                error_msg.push(error.errors[key].message);
            }
            const profile_photo = req.session.user ? `./profiles/${req.session.user.profile_photo}` : "./media/PG_3.png";
            const nav_bar_by_role = req.session.user ? (req.session.user.role === "ADMIN" ? "admin_nav" : "navigation") : "navigation";
            return res.render("signin_error", { title: "Error", error_msg, profile_photo, navigation_bar: nav_bar_by_role });
        }
    });

/*
    ######
    log in
    ######
*/
router.route("/login")
    .get((req, res) => {
        const profile_photo = req.session.user ? `./profiles/${req.session.user.profile_photo}` : "./media/PG_3.png";
        const nav_bar_by_role = req.session.user ? (req.session.user.role === "ADMIN" ? "admin_nav" : "navigation") : "navigation";
        return res.render("login", { title: "Login", css_file: "createUser.css", profile_photo, navigation_bar: nav_bar_by_role })
    })
    .post(async (req, res) => {
        const profile_photo = req.session.user ? `./profiles/${req.session.user.profile_photo}` : "./media/PG_3.png";
        const nav_bar_by_role = req.session.user ? (req.session.user.role === "ADMIN" ? "admin_nav" : "navigation") : "navigation";
        try {
            const { gmail, password } = req.body;
            const user = await USER_MODEL.findOne({ gmail });
            if (!user) {
                throw new Error("User not found");
            }
            const isValidUser = await bcrypt.compare(password, user.password);
            if (isValidUser) {
                req.session.user = user;
                req.session.isAuth = true;
                return res.redirect("/");
            } else {
                return res.render("404", { title: "Error", profile_photo, navigation_bar: nav_bar_by_role, responce_code: 404, error: "user not found" });
            }
        } catch (error) {
            return res.render("404", { title: "Error", profile_photo, navigation_bar: nav_bar_by_role, responce_code: 404, error });
        };
    });


/*
    #######
    log out
    #######
*/
router.get("/log_out", isAuth, async (req, res) => {
    const profile_photo = req.session.user ? `./profiles/${req.session.user.profile_photo}` : "./media/PG_3.png";
    const nav_bar_by_role = req.session.user ? (req.session.user.role === "ADMIN" ? "admin_nav" : "navigation") : "navigation";
    try {
        req.session.destroy();
        return res.redirect("/");
    } catch (error) {
        return res.render("404", { title: "Error", profile_photo, navigation_bar: nav_bar_by_role, responce_code: 202, error: err });
    }
});


/*
    #############
    add book
    #############
*/
router.use("/add_books", add_book_route);


/*
    #############
    delete book
    #############
*/
router.post("/delete_book", async (req, res) => {
    try {
        let responceFormDB = await BOOK_MODEL.findOne({ name: req.body.book_name, author: req.body.author_name });
        const bookPhoto = path.join(__dirname, `../public/books_photo/${responceFormDB.photo}`);
        responceFormDB = await BOOK_MODEL.findByIdAndDelete({ _id: responceFormDB._id });
        fs.unlink(bookPhoto);
        if (!responceFormDB) {
            throw new Error("book not found");
        }
        res.json({ redirectUrl: "/books", status: true });
    } catch (error) {
        const profile_photo = req.session.user ? `./profiles/${req.session.user.profile_photo}` : "./media/PG_3.png";
        const nav_bar_by_role = req.session.user ? (req.session.user.role === "ADMIN" ? "admin_nav" : "navigation") : "navigation";
        res.render('404', { title: "Error", navigation_bar: nav_bar_by_role, profile_photo, responce_code: 202, error: `<p>can't delete book</p>` });
    }
});

/*
    ############
    search books
    ############
*/

router.get("/find_book", isAuth, async (req, res) => {
    const profile_photo = req.session.user ? `./profiles/${req.session.user.profile_photo}` : "./media/PG_3.png";
    const nav_bar_by_role = req.session.user ? (req.session.user.role === "ADMIN" ? "admin_nav" : "navigation") : "navigation";
    try {
        const book_name = req.query.book_name;
        const books = await BOOK_MODEL.find({ name: book_name });
        if (!books) {
            throw new Error("Did't match your search");
        }
        return res.render("all_books", { user: req.session.user.role, title: "Books", books, profile_photo, navigation_bar: nav_bar_by_role });
    } catch (error) {
        return res.render("404", { title: "Error", profile_photo, navigation_bar: nav_bar_by_role, responce_code: 404, error });
    }
})

/*
    #########
    give_back
    #########
*/

router.delete("/give_back", async (req, res) => {
    try {
        const book_name = req.body.book_name;
        const book_doc = await BOOK_MODEL.findOne({ name: book_name });
        const book_id = new ObjectId(book_doc._id);
        const student_id = new ObjectId(req.session.user._id);
        await BOOK_MODEL.updateOne(
            { _id: book_id },
            { $inc: { stock: 1 } }
        );
        const cart = await CART_MODEL.findOneAndDelete({ student_id, book_id});
        res.json({ status: true });
    } catch (error) {
        res.json({ status: false, error: "can't delete"});
    }
});

/*
    ##############
    authntication
    ##############
*/
function isAuth(req, res, next) {
    if (!req.session.user) {
        return res.redirect("/login");
    }
    next();
}

module.exports = router;
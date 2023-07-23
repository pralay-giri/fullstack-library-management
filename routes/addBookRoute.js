const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser")
const multer = require("multer")
const BOOK_MODEL = require("../models/books");

router.use("/", bodyParser.urlencoded({ extended: true }));

const storage = multer.diskStorage({
    destination: "./public/books_photo",
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname);
    }
});

const upload = multer({ storage });

router.route("/")
    .get((req, res) => {
        const profile_photo = req.session.user ? `./profiles/${req.session.user.profile_photo}` : "./media/PG_3.png";
        const nav_bar_by_role = req.session.user ? (req.session.user.role === "ADMIN" ? "admin_nav" : "navigation") : "navigation";
        return res.render("addbooks", { title: "Add books", navigation_bar: nav_bar_by_role, profile_photo });
    })
    .post(upload.single("photo"), async (req, res) => {
        const profile_photo = req.session.user ? `./profiles/${req.session.user.profile_photo}` : "./media/PG_3.png";
        const nav_bar_by_role = req.session.user ? (req.session.user.role === "ADMIN" ? "admin_nav" : "navigation") : "navigation";
        try {
            const file_name = {
                photo: req.file.filename
            };
            const bookOdj = BOOK_MODEL({ ...file_name, ...req.body });
            const responce_form_db = await bookOdj.save();
            if (responce_form_db) {
                res.render("bookAddedMsg", { title: "seccess", navigation_bar: nav_bar_by_role, profile_photo });
            }
            else{
                throw new Error("can't add book");
            }
        } catch (err) {
            res.render('404', { title: "Error", navigation_bar: nav_bar_by_role, profile_photo, responce_code: 202, error: `<p>can't add book <a href="/add_books">back to add book</a></p>` });
        }
    });

module.exports = router;
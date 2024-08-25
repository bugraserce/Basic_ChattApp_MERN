const express = require('express')
const router = express.Router();
const UserModelDB = require('../Models/userModel')
const Fakedata = require('../FakeData/data');
const generateToken = require('../JWT/generateToken');
const verifyUser = require('../Midlleware/verifyUser')

router.get('/getData', async (req, res) => {
    res.json(Fakedata);
});



router.post('/register', async (req, res) => {
    let { name, email, password, pic } = req.body;

    if (!name || !email || !password) {
        res.status(400);
        throw new Error("Please Enter all the fields");
    }

    if (!pic) {
        pic = "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg";
    }

    try {
        const userExists = await UserModelDB.findOne({ email });

        if (userExists) {
            res.status(400);
            throw new Error("User already exists");
        }

        const user = await UserModelDB.create({
            name,
            email,
            password,
            pic,
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                pic: user.pic,
                token: generateToken(user._id),
            });
        } else {
            res.status(400);
            throw new Error("Failed to create user");
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await UserModelDB.findOne({ email });
        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                pic: user.pic,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: "Invalid Email or Password" });
        }
    } catch (error) {
        console.log(error);
        res.status(501).json({ message: "External Server Error" });
    }
});


router.get('/allUsers', verifyUser, async (req, res) => {
    const keyword = req.query.search ? {
        $or: [
            { name: { $regex: req.query.search, $options: "i" } },
            { email: { $regex: req.query.search, $options: "i" } }
        ]
    } : {};

    try {
        const usersExceptMe = await UserModelDB.find(keyword).find({ _id: { $ne: req.user._id } })  
        res.send(usersExceptMe);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch users", error: error.message });
    }
});









module.exports = router;
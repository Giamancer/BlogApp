const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
require("dotenv").config();

// Register a new user
exports.register = async (req, res, next) => {
    try {
        const { email, username, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already in use" });
        }

        // Remove hashing here:
        // const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            email,
            username,
            password, // <-- set raw password, model hashes it automatically
        });

        await newUser.save();

        res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
        next(err);
    }
};
// Login user
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ message: "Invalid email or password" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Invalid email or password" });

        const token = jwt.sign({
            id: user._id,
            email: user.email,
            isAdmin: user.isAdmin
        }, process.env.JWT_SECRET_KEY);

        res.json({ token, user: { id: user._id, email: user.email, username: user.username, isAdmin: user.isAdmin } });
    } catch (err) {
        next(err);
    }
};

// Optional: Get user profile
exports.getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        res.json(user);
    } catch (err) {
        next(err);
    }
};

// Admin-only: Create a new admin user
exports.createAdmin = async (req, res, next) => {
    try {
        const { email, username, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already in use" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newAdmin = new User({
            email,
            username,
            password: hashedPassword,
            isAdmin: true
        });

        await newAdmin.save();

        res.status(201).json({ message: "Admin user created successfully" });
    } catch (err) {
        next(err);
    }
};

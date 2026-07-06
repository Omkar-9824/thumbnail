"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyUser = exports.logoutUser = exports.loginUser = exports.registerUser = void 0;
const User_1 = __importDefault(require("../models/User"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const user = await User_1.default.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already esists' });
        }
        const salt = await bcrypt_1.default.genSalt(10);
        const hashedPassword = await bcrypt_1.default.hash(password, salt);
        const newUser = new User_1.default({ name, email, password: hashedPassword });
        await newUser.save();
        req.session.isLoggedIn = true;
        req.session.userId = newUser._id;
        return res.json({
            message: 'Account created successfully',
            user: {
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email
            }
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};
exports.registerUser = registerUser;
//user Login
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User_1.default.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }
        const isPasswordCorrect = await bcrypt_1.default.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }
        req.session.isLoggedIn = true;
        req.session.userId = user._id;
        return res.json({
            message: 'Login successfully',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email
            }
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};
exports.loginUser = loginUser;
//User Logout 
const logoutUser = async (req, res) => {
    req.session.destroy((error) => {
        if (error) {
            console.log(error);
            return res.status(500).json({ message: error.message });
        }
        res.clearCookie('connect.sid');
        return res.json({ message: 'Logout successful' });
    });
};
exports.logoutUser = logoutUser;
//user Verify
const verifyUser = async (req, res) => {
    try {
        const { userId } = req.session;
        const user = await User_1.default.findById(userId).select('-password');
        if (!user) {
            return res.status(400).json({ message: 'Invalid user' });
        }
        return res.json({ user });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};
exports.verifyUser = verifyUser;

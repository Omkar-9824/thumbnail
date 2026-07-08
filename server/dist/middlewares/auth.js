"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const protect = async (req, res, next) => {
    // Check if req.session exists and has valid login credentials
    if (!req.session || !req.session.isLoggedIn || !req.session.userId) {
        return res.status(401).json({ message: 'You are not logged in' });
    }
    next();
};
exports.default = protect;

import { Request, Response, NextFunction } from "express";

const protect = async (req: Request, res: Response, next: NextFunction) => {
    // Check if req.session exists and has valid login credentials
    if (!req.session || !req.session.isLoggedIn || !req.session.userId) { 
        return res.status(401).json({ message: 'You are not logged in' });
    }

    next();
};

export default protect;
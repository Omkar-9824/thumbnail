import express from "express";
import { getThumbnailbyId, getUsersThumbnails } from "../controllers/UserController";
import protect from "../middlewares/auth"; // Import it

const UserRouter = express.Router();

UserRouter.get('/thumbnails', protect, getUsersThumbnails); // Add it here
UserRouter.get('/thumbnail/:id', protect, getThumbnailbyId);

export default UserRouter;
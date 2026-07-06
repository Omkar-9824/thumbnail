import express from "express";
import { deleteThumbnail, generateThumbnail }
from "../controllers/CloudflareController";
import protect from "../middlewares/auth";

const ThumbnailRouter = express.Router();

ThumbnailRouter.post('/generate',protect, generateThumbnail);
ThumbnailRouter.delete('/delete/:id', protect, deleteThumbnail);

export default ThumbnailRouter;



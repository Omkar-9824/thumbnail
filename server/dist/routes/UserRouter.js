"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const UserController_1 = require("../controllers/UserController");
const auth_1 = __importDefault(require("../middlewares/auth")); // Import it
const UserRouter = express_1.default.Router();
UserRouter.get('/thumbnails', auth_1.default, UserController_1.getUsersThumbnails); // Add it here
UserRouter.get('/thumbnail/:id', auth_1.default, UserController_1.getThumbnailbyId);
exports.default = UserRouter;

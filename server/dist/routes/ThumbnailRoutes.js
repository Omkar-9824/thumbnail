"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const CloudflareController_1 = require("../controllers/CloudflareController");
const auth_1 = __importDefault(require("../middlewares/auth"));
const ThumbnailRouter = express_1.default.Router();
ThumbnailRouter.post('/generate', auth_1.default, CloudflareController_1.generateThumbnail);
ThumbnailRouter.delete('/delete/:id', auth_1.default, CloudflareController_1.deleteThumbnail);
exports.default = ThumbnailRouter;

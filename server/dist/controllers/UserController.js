"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getThumbnailbyId = exports.getUsersThumbnails = void 0;
const Thumbnail_1 = __importDefault(require("../models/Thumbnail"));
const getUsersThumbnails = async (req, res) => {
    try {
        const { userId } = req.session;
        const thumbnail = await Thumbnail_1.default.find({ userId }).sort({ createdAt: -1 });
        res.json({ thumbnail });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};
exports.getUsersThumbnails = getUsersThumbnails;
const getThumbnailbyId = async (req, res) => {
    try {
        const { userId } = req.session;
        const { id } = req.params;
        const thumbnail = await Thumbnail_1.default.findOne({ userId, _id: id });
        if (!thumbnail) {
            return res.status(404).json({ message: "Thumbnail not found" });
        }
        res.json({ thumbnail });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};
exports.getThumbnailbyId = getThumbnailbyId;

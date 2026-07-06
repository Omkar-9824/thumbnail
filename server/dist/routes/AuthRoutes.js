"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const AuthControllers_1 = require("../controllers/AuthControllers");
const auth_1 = __importDefault(require("../middlewares/auth"));
const AuthRouter = express_1.default.Router();
AuthRouter.post('/register', AuthControllers_1.registerUser);
AuthRouter.post('/login', AuthControllers_1.loginUser);
AuthRouter.get('/verify', auth_1.default, AuthControllers_1.verifyUser);
AuthRouter.post('/logout', auth_1.default, AuthControllers_1.logoutUser);
exports.default = AuthRouter;

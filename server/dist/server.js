"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
require("dotenv/config");
const db_1 = __importDefault(require("./configs/db"));
const express_session_1 = __importDefault(require("express-session"));
const connect_mongo_1 = __importDefault(require("connect-mongo"));
const AuthRoutes_1 = __importDefault(require("./routes/AuthRoutes"));
const ThumbnailRoutes_1 = __importDefault(require("./routes/ThumbnailRoutes"));
const UserRouter_js_1 = __importDefault(require("./routes/UserRouter.js"));
(0, db_1.default)();
const app = (0, express_1.default)();
const isProduction = process.env.NODE_ENV === 'production';
// Middleware
app.use((0, cors_1.default)({
    origin: [
        'http://localhost:5173',
        'http://localhost:5173/',
        'http://localhost:3000',
        'http://localhost:3000/',
        'https://thumbnail-beta-three.vercel.app'
    ],
    credentials: true
}));
// 1. Tell Express to trust reverse proxies (Vercel/Render/Heroku etc.)
app.set('trust proxy', 1);
// 2. Update your session config
app.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7,
        secure: isProduction, // Set to true only in production (HTTPS)
        sameSite: isProduction ? 'none' : 'lax' // Allows cross-origin in dev (lax), none in production (HTTPS)
    },
    store: connect_mongo_1.default.create({
        mongoUrl: process.env.MONGODB_URL,
        collectionName: 'session'
    })
}));
app.use(express_1.default.json());
const port = process.env.PORT || 3000;
app.get('/', (req, res) => {
    res.send('Server is Live!');
});
app.use('/api/auth', AuthRoutes_1.default);
app.use('/api/thumbnail', ThumbnailRoutes_1.default);
app.use('/api/user', UserRouter_js_1.default);
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

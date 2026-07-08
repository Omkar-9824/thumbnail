import "dotenv/config";
import express, { Request, Response } from 'express';
import cors from "cors";
import 'dotenv/config'
import connectDB from "./configs/db";
import session from 'express-session' 
import MongoStore  from "connect-mongo";
import AuthRouter from "./routes/AuthRoutes";
import ThumbnailRouter from "./routes/ThumbnailRoutes";
import UserRouter from "./routes/UserRouter.js";

declare module 'express-session'{
    interface SessionData{
        isLoggedIn:boolean;
        userId:string 
    }
}

connectDB()
const app = express();

const isProduction = process.env.NODE_ENV === 'production';

// Middleware
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:5173/',
        'http://localhost:3000',
        'http://localhost:3000/',
        'https://thumbnail-beta-three.vercel.app'
    ],
    credentials: true
}))

// 1. Tell Express to trust reverse proxies (Vercel/Render/Heroku etc.)
app.set('trust proxy', 1);

// 2. Update your session config
app.use(session({
    secret: process.env.SESSION_SECRET as string,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7,
        secure: isProduction,      // Set to true only in production (HTTPS)
        sameSite: isProduction ? 'none' : 'lax'   // Allows cross-origin in dev (lax), none in production (HTTPS)
    },
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URL as string,
        collectionName: 'session'
    })
}));
app.use(express.json());

const port = process.env.PORT || 3000;

app.get('/', (req: Request, res: Response) => {
    res.send('Server is Live!');
});
app.use('/api/auth',AuthRouter)
app.use('/api/thumbnail',ThumbnailRouter) 
app.use('/api/user',UserRouter)

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
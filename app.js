import express from "express";
import dotenv from 'dotenv';
import path from "path";
import { fileURLToPath } from 'url';
import session from 'express-session';
import passport from 'passport';
import initializePassport from './config/passport-config.js';
import MongoStore from 'connect-mongo';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import mainRouter from "./routers/router.js";
import { connectDB, seedDataBase } from './config/database.js';

let shuttingDown = false;

dotenv.config();

//passport initialization
initializePassport(passport);
 
// Helper to get __dirname in ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const PROJECT_ROOT = __dirname;

const PORT = process.env.PORT || 3737;

const startServer = async () => {
    const app = express();

    // Serve all public files in the public folder (must be done before mounting main routes)
    app.use(express.static(path.join(PROJECT_ROOT, "public")));

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.use(cookieParser());

    app.use(session({
        name: 'inventory.sid',
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
            mongoUrl: process.env.MONGO_URL // MongoDB connection string
        }),
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 * 7, // Cookie expires 1 week
        }
    }));

    app.use(passport.initialize());
    app.use(passport.session());

    // View engine setup
    app.set("views", path.join(PROJECT_ROOT, "views"));
    app.set("view engine", "ejs");


    //Mount all of the routes to /
    app.use("/", mainRouter);


    const server = app.listen(PORT, () => {
        console.log(`Server running on [http://localhost:${PORT}/]`);
    });

    const shutdown = async (signal) => {
        if (shuttingDown) return;
        shuttingDown = true;

        console.log(`\n[${signal}] Shutting down...`);

        const forceExitTimer = setTimeout(() => {
            console.error("Force exit");
            process.exit(1);
        }, 10_000);

        try {
            scheduler.stopScheduler();

            await new Promise((resolve, reject) => {
                server.close(err => (err ? reject(err) : resolve()));
            });

            server.closeAllConnections?.();
            server.closeIdleConnections?.();

            await mongoose.disconnect();

            clearTimeout(forceExitTimer);
            process.exit(0);
        } catch (err) {
            console.error("Shutdown failed:", err);
            clearTimeout(forceExitTimer);
            process.exit(1);
        }
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
}

// Connect to the database and then start the server
connectDB().then(async () => {
    seedDataBase();
    startServer();
});

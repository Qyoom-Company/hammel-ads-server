import express, { Application } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import connection from "./services/db";
import authRoutes from "./routes/auth";
import profileRoutes from "./routes/profile";
import rateLimit, { MemoryStore } from "express-rate-limit";
require("dotenv").config();

const app: Application = express();

// rate limiter
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    store: new MemoryStore(),
});

// database connection
connection();

// middlewares
app.use(bodyParser.json());
app.use(express.json());
app.use(cors());

// routes
app.use("/api/auth", limiter, authRoutes);
app.use("/api/profiles", profileRoutes);

// port
const port: number = Number(process.env.PORT) || 3500;

// start server
app.listen(port, () => {
    console.log(`server started on port ${port}...`);
});

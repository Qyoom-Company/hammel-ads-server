import express, { Application } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import connection from "./services/db";
import authRoutes from "./routes/auth";
import userRoutes from "./routes/user";
import campaignRoutes from "./routes/campaigns";
import paymentRoutes from "./routes/payments";
import rateLimit, { MemoryStore } from "express-rate-limit";
import helmet from "helmet";
require("dotenv").config();

const app: Application = express();

// rate limiter
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: process.env.ENV === "DEV" ? 1555 : 5,
    standardHeaders: true,
    store: new MemoryStore(),
    statusCode: 429,
    message: {
        status: "error",
        message: "too many requests, try again later",
    },
});

// database connection
connection();

// middlewares
app.use(bodyParser.json());
app.use(express.json());
app.use(cors());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.disable("x-powered-by");

// routes
app.use("/api/auth", limiter, authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/campaigns", campaignRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/uploads", express.static("uploads"));

// port
const port: number = Number(process.env.PORT) || 3500;

// start server
app.listen(port, () => {
    console.log(`server started on port ${port}...`);
});

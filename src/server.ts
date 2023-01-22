import express, { Application } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import connection from "./services/db";
import authRoutes from "./routes/auth";
import profileRoutes from "./routes/profile";
require("dotenv").config();

const app: Application = express();

// database connection
connection();

// middlewares
app.use(bodyParser.json());
app.use(express.json());
app.use(cors());

// routes
app.use("/api/auth", authRoutes);
app.use("/api/profiles", profileRoutes);

// port
const port: number = Number(process.env.PORT) || 3500;

// start server
app.listen(port, () => {
    console.log(`server started on port ${port}...`);
});

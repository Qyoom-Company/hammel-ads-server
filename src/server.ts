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

app.use("/api/auth", authRoutes);
app.use("/api/profiles", profileRoutes);

const port: number = Number(process.env.PORT) || 3500;

app.listen(port, () => {
    console.log(`server started on port ${port}...`);
});

import express, { Application } from "express";
import test from "./middlewares/test";

const app: Application = express();

app.use("/", test, (req, res) => {
    res.send("hello");
});

app.listen(3000, () => {
    console.log("server started...");
});

import express, { Request, Response } from "express";
import userController from "../controllers/userController";
import authMiddleware from "../middlewares/Auth";

const router = express.Router();

router.get("/getuser", authMiddleware.validate, userController.getUserInfo);

export default router;

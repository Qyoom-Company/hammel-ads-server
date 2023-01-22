import express, { Request, Response } from "express";
import authMiddleware from "../middlewares/Auth";

const router = express.Router();

router.get(
    "/myprofile",
    authMiddleware.validate,
    (req: Request, res: Response) => {
        return res.status(200).json(req.currentUser);
    }
);

export default router;

import express from "express";
import { body } from "express-validator";
import AnalyiticsController from "../controllers/analyticsController";
import { EventType } from "../types/event/EventType";
import AuthMiddleware from "../middlewares/Auth";

const router = express.Router();

router.post(
    "/user-stats",
    AuthMiddleware.validate,
    AnalyiticsController.getAllUserStats
);

router.post(
    "/user-analytics",
    AuthMiddleware.validate,
    AnalyiticsController.getUserAnalyitics
);

router.post(
    "/campaign-stats",
    AuthMiddleware.validate,
    AnalyiticsController.getSingleCampaignStats
);

router.post(
    "/campaign-analytics",
    AuthMiddleware.validate,
    AnalyiticsController.getCampaignAnalyitics
);

export default router;

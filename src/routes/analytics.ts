import express from "express";
import { body } from "express-validator";
import AnalyiticsController from "../controllers/analyticsController";
import { EventType } from "../types/event/EventType";
import AuthMiddleware from "../middlewares/Auth";

const router = express.Router();

router.get(
    "/user-stats",
    AuthMiddleware.validate,
    AnalyiticsController.getAllUserStats
);

router.get(
    "/campaign-stats",
    AuthMiddleware.validate,
    AnalyiticsController.getSingleCampaignStats
);

/*

stats (click , views, clickrate) (date filtering)  [total and per campaign]

then we have the analyitics that we will need in the graph (we will need the dates that's why)

we will have labels which are everyday from and to
and the values of number of events on that date
and filter by type ofcourse




*/

// router.get(
//     "/campaign-analyitics",
//     body("type").isIn(Object.values(EventType)),
//     body("campaignId").notEmpty(),
//     body("userId").notEmpty(),
//     body("deviceId").notEmpty(),
//     body("placementId").notEmpty(),
//     AnalyiticsController.save
// );

/*

analyitic meaning:

from - to date:

views, clicks, clickrate, spent

functions:

function that gets all events for a single user (from and to optional)
function that gets events from a specific campaign (from and to optional)

totalUserAnalyitics (clicks, views, clickRate) for all the campaigns combined
lastTwoWeeksAnalyitics (clicks, views, clickRate) for the last two weeks

*/
export default router;

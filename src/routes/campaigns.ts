import express, { Request, Response } from "express";
import { body } from "express-validator";
import multer from "multer";
import userController from "../controllers/userController";
import authMiddleware from "../middlewares/Auth";
import fileUpload from "express-fileupload";
import CampaignController from "../controllers/campaignController";
import { CampaignStatus } from "../types/campaign/CampaignStatus";
import countryList from "../static/countryList";
const router = express.Router();

router.post(
    "/",
    authMiddleware.validate,
    body("title").isLength({ min: 3, max: 30 }),
    body("startDate").isDate({ format: "MM/DD/YYYY" }),
    body("endDate").isDate({ format: "MM/DD/YYYY" }),
    body("budget").isNumeric(),
    body("country").isIn(countryList),
    body("photoPath").notEmpty(),
    body("link").notEmpty(),
    body("status").isIn([CampaignStatus.DRAFT, CampaignStatus.INREVIEW]),
    CampaignController.addCampaign
);

router.get("/", authMiddleware.validate, CampaignController.getAllCampaigns);
router.get("/:id", authMiddleware.validate, CampaignController.getOneCampaign);
router.patch(
    "/:id",
    body("title").isLength({ min: 3, max: 30 }),
    body("startDate").isDate({ format: "MM/DD/YYYY" }),
    body("endDate").isDate({ format: "MM/DD/YYYY" }),
    body("budget").isNumeric(),
    body("country").notEmpty(),
    body("photoPath").notEmpty(),
    body("link").notEmpty(),
    body("status").isIn(Object.values(CampaignStatus)),
    authMiddleware.validate,
    CampaignController.updateCampaign
);

router.post(
    "/upload-campaign-photo",
    fileUpload({ createParentPath: false }),
    authMiddleware.validate,
    CampaignController.uploadCampaignPhoto
);

export default router;

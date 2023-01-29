import express, { Request, Response } from "express";
import { body } from "express-validator";
import multer from "multer";
import userController from "../controllers/userController";
import authMiddleware from "../middlewares/Auth";
import fileUpload from "express-fileupload";
import CampaignController from "../controllers/campaignController";
import { CampaignStatus } from "../types/campaign/CampaignStatus";
const router = express.Router();

// // const upload = multer({ dest: "uploads/" });
// router.use(fileUpload({ createParentPath: false }));

router.post(
    "/",
    authMiddleware.validate,
    body("title").isLength({ min: 3, max: 100 }),
    body("startDate").isDate({ format: "DD/MM/YYYY" }),
    body("endDate").isDate({ format: "DD/MM/YYYY" }),
    body("budget").isNumeric(),
    body("country").notEmpty(),
    body("photoPath").notEmpty(),
    body("link").notEmpty(),
    body("status").equals(CampaignStatus.DRAFT || CampaignStatus.INREVIEW),
    CampaignController.addCampaign
);

router.get("/", authMiddleware.validate, CampaignController.getAllCampaigns);
router.get("/:id", authMiddleware.validate, CampaignController.getOneCampaign);
router.patch(
    "/:id",
    body("title").isLength({ min: 3, max: 100 }),
    body("startDate").isDate({ format: "DD/MM/YYYY" }),
    body("endDate").isDate({ format: "DD/MM/YYYY" }),
    body("budget").isNumeric(),
    body("country").notEmpty(),
    body("photoPath").notEmpty(),
    body("link").notEmpty(),
    body("status").isIn(Object.values(CampaignStatus)),
    authMiddleware.validate,
    CampaignController.updateCampaign
);

export default router;

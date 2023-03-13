import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { ValidationError, ValidationResult } from "../types/validation";
import CampaignSchema from "../models/CampaignSchema";
import { isValidObjectId } from "mongoose";
import path from "path";
import MediaController from "./mediaController";
import { CampaignStatus } from "../types/campaign/CampaignStatus";
import { sendEmailToAdmin, sendReviewEmailToUser } from "../services/email";
import User from "../models/UserSchema";
class CampaignController {
    static addCampaign = async (req: Request, res: Response) => {
        try {
            console.log(req);
            if (req.currentUser?.isEmailConfirmed === false) {
                return res.status(401).json({
                    status: "error",
                    message: "email not confirmed",
                });
            } else {
                const validationResults = validationResult(
                    req
                ) as unknown as ValidationResult;
                const errors: ValidationError[] =
                    (validationResults?.errors as ValidationError[]) || [];
                if (errors.length > 0) {
                    return res.status(400).json({
                        status: "error",
                        message: `invalid ${errors[0]?.param} : ${errors[0]?.value}`,
                    });
                }

                const {
                    title,
                    startDate,
                    endDate,
                    budget,
                    country,
                    photoPath,
                    link,
                    status,
                } = req.body;

                console.log(startDate, endDate);

                let startDateFormatted = new Date(startDate).toISOString();
                let endDateFormatted = new Date(endDate).toISOString();

                const campaign = new CampaignSchema({
                    title,
                    startDate: startDateFormatted,
                    endDate: endDateFormatted,
                    budget,
                    country,
                    photoPath,
                    link,
                    status,
                    userId: req.currentUser?._id,
                });

                campaign.save();

                if (status === CampaignStatus.INREVIEW) {
                    // send email to administration team
                    sendEmailToAdmin(campaign._id, "admin@gmail.com");
                }

                return res.status(200).json({
                    status: "success",
                    message: "campaign added successfully",
                    data: campaign,
                });
            }
        } catch (err) {
            console.log(err);
        }
    };

    static getAllCampaigns = async (req: Request, res: Response) => {
        try {
            if (req.currentUser?.isAdmin) {
                const campaigns = await CampaignSchema.find();
                return res.status(200).json({
                    status: "success",
                    message: "campaigns fetched successfully",
                    data: campaigns,
                });
            } else {
                const campaigns = await CampaignSchema.find({
                    userId: req.currentUser?._id,
                });
                return res.status(200).json({
                    status: "success",
                    message: "campaigns fetched successfully",
                    data: campaigns,
                });
            }
        } catch (err) {
            return res.status(500).json({
                status: "error",
                message: "internal server error",
            });
        }
    };
    static getOneCampaign = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            if (!isValidObjectId(id)) {
                return res.status(400).json({
                    status: "error",
                    message: "invalid campaign id",
                    data: null,
                });
            }

            const campaign = await CampaignSchema.findById(id);
            console.log(campaign);
            if (!campaign) {
                return res.status(404).json({
                    status: "error",
                    message: "campaign not found",
                    data: null,
                });
            }
            console.log(`${campaign.userId}heeyyy${req?.currentUser?._id}`);
            if (
                campaign.userId !== String(req?.currentUser?._id) &&
                req?.currentUser?.isAdmin !== true
            ) {
                return res.status(401).json({
                    status: "error",
                    message: "unauthorized access",
                    data: null,
                });
            }

            return res.status(200).json({
                status: "success",
                message: "campaign fetched successfully",
                data: campaign,
            });
        } catch (err) {
            return res.status(500).json({
                status: "error",
                message: "internal server error",
            });
        }
    };

    static updateCampaign = async (req: Request, res: Response) => {
        try {
            const validationResults = validationResult(
                req
            ) as unknown as ValidationResult;
            const errors: ValidationError[] =
                (validationResults?.errors as ValidationError[]) || [];
            if (errors.length > 0) {
                return res.status(400).json({
                    status: "error",
                    message: `invalid ${errors[0]?.param} : ${errors[0]?.value}`,
                });
            }

            const { id } = req.params;
            if (!isValidObjectId(id)) {
                return res.status(400).json({
                    status: "error",
                    message: "invalid campaign id",
                    data: null,
                });
            }

            const campaign = await CampaignSchema.findById(id);
            if (!campaign) {
                return res.status(404).json({
                    status: "error",
                    message: "campaign not found",
                    data: null,
                });
            }

            let {
                title,
                startDate,
                endDate,
                budget,
                country,
                photoPath,
                link,
                status,
                adminMessage,
            } = req.body;

            console.log(startDate);

            let startDateFormatted = new Date(startDate).toISOString();
            let endDateFormatted = new Date(endDate).toISOString();

            if (
                campaign.userId !== String(req?.currentUser?._id) &&
                req?.currentUser?.isAdmin !== true
            ) {
                return res.status(401).json({
                    status: "error",
                    message: "unauthorized access",
                    data: null,
                });
            }

            if (req?.currentUser?.isAdmin) {
                await campaign.update({
                    title,
                    startDateFormatted,
                    endDateFormatted,
                    budget,
                    country,
                    photoPath,
                    link,
                    status,
                    adminMessage: adminMessage,
                });
                if (adminMessage) {
                    const user = await User.findById(campaign.userId);
                    if (!user)
                        return res.status(500).json({
                            status: "error",
                            message: "internal server error",
                        });
                    sendReviewEmailToUser(adminMessage, user.email);
                }
            } else {
                if (
                    campaign.photoPath !== photoPath ||
                    campaign.link !== link
                ) {
                    status = CampaignStatus.INREVIEW;
                    // send email to administration team
                    sendEmailToAdmin(campaign._id, "admin@gmail.com");
                } else {
                    status = campaign.status;
                }
                console.log(status);
                await campaign.update({
                    title,
                    startDateFormatted,
                    endDateFormatted,
                    budget,
                    country,
                    photoPath,
                    link,
                    status,
                    adminMessage: "",
                });
            }

            return res.status(200).json({
                status: "success",
                message: "campaign updated successfully",
                data: {
                    title,
                    startDate,
                    endDate,
                    budget,
                    country,
                    photoPath,
                    link,
                    status,
                },
            });
        } catch (err) {
            console.log(err);
            return res.status(500).json({
                status: "error",
                message: "internal server error",
            });
        }
    };

    static uploadCampaignPhoto = async (req: Request, res: Response) => {
        try {
            // @ts-ignore
            const file = req.files?.campaignPhoto;
            if (!file) {
                return res
                    .status(400)
                    .json({ status: "error", message: "no file selected!" });
            }
            const extention = path.parse(file.name).ext;
            if (!file.mimetype.startsWith("image")) {
                res.status(400).json({
                    status: "error",
                    message: "invalid file type",
                });
            }
            const filename = await MediaController.saveFile(file);

            const domain =
                process.env.ENV === "DEV"
                    ? "http://localhost:3500"
                    : "https://api.gate.hammel.in";
            res.status(200).json({
                status: "success",
                message: "photo uploaded",
                data: {
                    photoPath: `${domain}/uploads/${filename}${extention}`,
                },
            });
        } catch (err: any) {
            console.log(err);

            res.status(500).json({
                status: "error",
                message: "internal server error",
            });
        }
    };
}

export default CampaignController;

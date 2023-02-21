import { Request, Response } from "express";
import bcrypt from "bcrypt";
import UserSchema from "../models/UserSchema";
import { validationResult } from "express-validator";
import { ValidationError, ValidationResult } from "../types/validation";
import { sendPasswordResetEmail } from "../services/email";
import crypto from "crypto";
import User from "../models/UserSchema";
import Campaign from "../models/CampaignSchema";
import Event from "../types/event";
import { isValidObjectId } from "mongoose";
import { EventType } from "../types/event/EventType";
import moment from "moment";
class AnalyiticsController {
    static getUserAnalyitics = async (req: Request, res: Response) => {
        try {
        } catch (err) {
            console.log(err);
        }
    };

    static getAllUserEvents = async (req: Request, res: Response) => {
        try {
            const { from, to } = req.body;
            if (from) {
                if (!moment(from).isValid())
                    return res
                        .status(400)
                        .json({ status: "error", message: "invalid date" });
            }
            if (to) {
                if (!moment(to).isValid())
                    return res
                        .status(400)
                        .json({ status: "error", message: "invalid date" });
            }

            // if (!type || ![EventType.CLICK, EventType.VIEW].includes(type)) {
            //     return res.status(400).json({
            //         status: "error",
            //         message: "invalid event type",
            //     });
            // }

            const clicks = await this.getAllCampaignsEventsByDateRange(
                EventType.CLICK,
                req?.currentUser?._id || "",
                from,
                to
            );
            const views = await this.getAllCampaignsEventsByDateRange(
                EventType.VIEW,
                req?.currentUser?._id || "",
                from,
                to
            );

            const clickRate = (clicks / views) * 100;

            return res.status(200).json({
                status: "success",
                message: "stats fetched successfully",
                data: {
                    clicks,
                    views,
                    clickRate: Number(clickRate.toFixed(2)),
                },
            });
        } catch (err: any) {
            return res.status(200).json({
                status: "error",
                message: "internal server error",
            });
        }
    };

    static getSingleCampaignEvents = async (req: Request, res: Response) => {
        try {
            const { campaignId, from, to } = req.body;

            // if (!type || ![EventType.CLICK, EventType.VIEW].includes(type)) {
            //     return res.status(400).json({
            //         status: "error",
            //         message: "invalid event type",
            //     });
            // }

            if (!campaignId)
                return res.status(400).json({
                    status: "error",
                    message: "campaignId not specified",
                });

            if (!isValidObjectId(campaignId))
                return res.status(400).json({
                    status: "error",
                    message: "invalid campaignId",
                });

            const clicks = await this.getOneCampaignEventsByDateRange(
                EventType.CLICK,
                campaignId,
                from,
                to
            );
            const views = await this.getOneCampaignEventsByDateRange(
                EventType.VIEW,
                campaignId,
                from,
                to
            );

            const clickRate = (clicks / views) * 100;

            return res.status(200).json({
                status: "success",
                message: "stats fetched successfully",
                data: {
                    clicks,
                    views,
                    clickRate: Number(clickRate.toFixed(2)),
                },
            });
        } catch (err: any) {
            console.log(err);
            return res.status(200).json({
                status: "error",
                message: "internal server error",
            });
        }
    };

    private static getAllCampaignsEventsByDateRange = async (
        eventType: string,
        currentUserId: string,
        fromDateString: string | null = null,
        toDateString: string | null = null
    ): Promise<number> => {
        try {
            const fromDate = fromDateString
                ? new Date(fromDateString)
                : undefined;
            const toDate = toDateString ? new Date(toDateString) : undefined;

            const campaigns = await Campaign.find({
                userId: currentUserId,
            }).populate("events");
            let filteredEvents = campaigns
                .flatMap((campaign) => campaign.events)
                .filter((event) => event.type === eventType);

            if (fromDate) {
                filteredEvents = filteredEvents.filter((event) => {
                    const createdAt = new Date(event.createdAt);
                    return createdAt >= fromDate;
                });
            }

            if (toDate) {
                filteredEvents = filteredEvents.filter((event) => {
                    const createdAt = new Date(event.createdAt);
                    return createdAt <= toDate;
                });
            }

            return filteredEvents.length;
        } catch (err: any) {
            console.log(err);
            return 0;
        }
    };

    private static getOneCampaignEventsByDateRange = async (
        eventType: string,
        campaignId: string,
        fromDateString: string | null = null,
        toDateString: string | null = null
    ): Promise<number> => {
        try {
            const fromDate = fromDateString
                ? new Date(fromDateString)
                : undefined;
            const toDate = toDateString ? new Date(toDateString) : undefined;

            const campaign = await Campaign.findById(campaignId).populate(
                "events"
            );
            if (!campaign) return 0;

            let filteredEvents = campaign.events.filter(
                (event) => event.type === eventType
            );

            if (fromDate) {
                filteredEvents = filteredEvents.filter((event) => {
                    const createdAt = new Date(event.createdAt);
                    return createdAt >= fromDate;
                });
            }

            if (toDate) {
                filteredEvents = filteredEvents.filter((event) => {
                    const createdAt = new Date(event.createdAt);
                    return createdAt <= toDate;
                });
            }

            return filteredEvents.length;
        } catch (err: any) {
            console.log(err);
            return 0;
        }
    };
}

export default AnalyiticsController;

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
            const { type, from, to } = req.body;

            console.log(type);

            // validate parameters

            if (!type || ![EventType.CLICK, EventType.VIEW].includes(type)) {
                return res.status(400).json({
                    status: "error",
                    message: "invalid event type",
                });
            }
            if (
                !from ||
                !to ||
                !moment(from).isValid() ||
                !moment(to).isValid()
            ) {
                return res
                    .status(400)
                    .json({ status: "error", message: "invalid date" });
            }

            const fromMoment = moment(from, "MM-DD-YYYY");
            const toMoment = moment(to, "MM-DD-YYYY");

            const labels: string[] = [];

            for (
                let date = fromMoment;
                date <= toMoment;
                date = date.clone().add(1, "d")
            ) {
                labels.push(date.format("YYYY-MM-DD"));
            }

            //get all events from user that are between from and to

            const campaigns = await Campaign.find({
                userId: req?.currentUser?._id,
            }).populate("events");
            let events = campaigns
                .flatMap((campaign) => campaign.events)
                .filter((event) => {
                    const createdAt = new Date(event.createdAt);
                    const fromDate = new Date(from);
                    const toDate = new Date(to);
                    toDate.setDate(toDate.getDate() + 2);

                    return (
                        createdAt >= fromDate &&
                        createdAt <= toDate &&
                        event.type === type
                    );
                });

            // group events by date

            const eventsByDate: { [key: string]: number } = {};

            events.forEach((event) => {
                const date = event.createdAt.toISOString().slice(0, 10);

                if (!eventsByDate[date]) {
                    eventsByDate[date] = 0;
                }
                eventsByDate[date]++;
            });

            // create data array with count of events for each date

            const data: number[] = [];
            labels.forEach((label) => {
                if (eventsByDate[label]) {
                    data.push(eventsByDate[label]);
                } else {
                    data.push(0);
                }
            });

            return res.json({
                status: "success",
                message: "analyitics fetched successfully",
                data: {
                    labels,
                    datasets: data,
                },
            });
        } catch (err) {
            console.log(err);
        }
    };

    static getAllUserStats = async (req: Request, res: Response) => {
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

    static getSingleCampaignStats = async (req: Request, res: Response) => {
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
            const campaign = await Campaign.findById(campaignId);

            if (!campaign) {
                return res.status(404).json({
                    status: "error",
                    message: "campaign not found",
                });
            }

            if (
                campaign.userId != req?.currentUser?._id &&
                !req?.currentUser?.isAdmin
            ) {
                return res.status(400).json({
                    status: "error",
                    message: "unauthorized",
                });
            }

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

    static getCampaignAnalyitics = async (req: Request, res: Response) => {
        try {
            const { type, from, to, campaignId } = req.body;

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

            // validate parameters

            if (!type || ![EventType.CLICK, EventType.VIEW].includes(type)) {
                return res.status(400).json({
                    status: "error",
                    message: "invalid event type",
                });
            }
            if (
                !from ||
                !to ||
                !moment(from).isValid() ||
                !moment(to).isValid()
            ) {
                return res
                    .status(400)
                    .json({ status: "error", message: "invalid date" });
            }

            const fromMoment = moment(from, "MM-DD-YYYY");
            const toMoment = moment(to, "MM-DD-YYYY");

            const labels: string[] = [];

            for (
                let date = fromMoment;
                date <= toMoment;
                date = date.clone().add(1, "d")
            ) {
                labels.push(date.format("YYYY-MM-DD"));
            }

            //get all events from user that are between from and to

            let campaign = await Campaign.findById(campaignId).populate(
                "events"
            );
            if (!campaign)
                return res.status(404).json({
                    status: "error",
                    message: "campaign not found",
                });

            if (
                campaign.userId != req?.currentUser?._id &&
                !req?.currentUser?.isAdmin
            ) {
                return res.status(400).json({
                    status: "error",
                    message: "unauthorized",
                });
            }

            const events = campaign.events.filter((event) => {
                const createdAt = new Date(event.createdAt);
                const fromDate = new Date(from);
                const toDate = new Date(to);
                toDate.setDate(toDate.getDate() + 2);

                return (
                    createdAt >= fromDate &&
                    createdAt <= toDate &&
                    event.type === type
                );
            });

            // group events by date

            const eventsByDate: { [key: string]: number } = {};

            events.forEach((event) => {
                const date = event.createdAt.toISOString().slice(0, 10);

                if (!eventsByDate[date]) {
                    eventsByDate[date] = 0;
                }
                eventsByDate[date]++;
            });

            // create data array with count of events for each date

            const data: number[] = [];
            labels.forEach((label) => {
                if (eventsByDate[label]) {
                    data.push(eventsByDate[label]);
                } else {
                    data.push(0);
                }
            });

            return res.json({
                labels,
                datasets: data,
            });
        } catch (err) {
            console.log(err);
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
            if (toDate) toDate.setDate(toDate.getDate() + 2);

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
            if (toDate) toDate.setDate(toDate.getDate() + 2);

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

import * as mongoose from "mongoose";
import { CampaignStatus } from "../types/campaign/CampaignStatus";
import Campaign from "../types/campaign";
import Event from "../types/event";
import Load from "../types/load";

const campaignSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },

    budget: {
        type: Number,
        required: true,
    },
    country: {
        type: String,
        required: true,
    },
    photoPath: {
        type: String,
        required: true,
    },
    link: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: Object.values(CampaignStatus),
        required: true,
    },
    userId: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    clicks: {
        type: Number,
        default: 0,
    },
    clickRate: {
        type: Number,
        default: null,
    },
    views: {
        type: Number,
        default: 0,
    },
    moneySpent: {
        type: Number,
        default: 0,
    },
    adminMessage: {
        type: String,
        default: null,
    },
    events: {
        type: Array<Event>,
        default: [],
    },
    loads: {
        type: Array<Load>,
        default: [],
    },
});

const Campaign = mongoose.model<Campaign & mongoose.Document>(
    "Campaign",
    campaignSchema
);

export default Campaign;

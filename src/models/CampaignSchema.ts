import * as mongoose from "mongoose";
import jwt, { Secret } from "jsonwebtoken";
import IUser from "../types/user/";
import { UserType } from "../types/user/UserType";
import crypto from "crypto";
import { sendConfirmationEmail } from "../services/email";
import { CampaignStatus } from "../types/campaign/CampaignStatus";
import Campaign from "../types/campaign";

const userSchema = new mongoose.Schema({
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
});

const Campaign = mongoose.model<Campaign & mongoose.Document>(
    "Campaign",
    userSchema
);

export default Campaign;

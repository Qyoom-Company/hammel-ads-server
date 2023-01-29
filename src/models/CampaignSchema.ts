import * as mongoose from "mongoose";
import jwt, { Secret } from "jsonwebtoken";
import IUser from "../types/user/";
import { UserType } from "../types/user/UserType";
import crypto from "crypto";
import { sendConfirmationEmail } from "../services/email";
import { CampaignStatus } from "../types/campaign/CampaignStatus";

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
});

const Campaign = mongoose.model<IUser & mongoose.Document>(
    "Campaign",
    userSchema
);

export default Campaign;

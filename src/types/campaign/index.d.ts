import mongoose from "mongoose";
import { CampaignStatus } from "./CampaignStatus";
export default interface Campaign {
    title: String;
    startDate: Date;
    endDate: Date;

    budget: {
        type: Number;
        required: true;
    };
    country: String;
    photoPath: String;
    link: String;
    status: CampaignStatus;
    userId: String;
    createdAt: Date;
    clicks: Number;
    clickRate: Number;
    views: Number;
    moneySpent: Number;
}

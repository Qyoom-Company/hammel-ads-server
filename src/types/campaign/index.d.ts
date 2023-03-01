import mongoose from "mongoose";
import { CampaignStatus } from "./CampaignStatus";
import Event from "../event";
import Load from "../load";
export default interface Campaign {
    title: string;
    startDate: Date;
    endDate: Date;
    budget: number;
    country: string;
    photoPath: string;
    link: string;
    status: CampaignStatus;
    userId: string;
    createdAt: Date;
    clicks: number;
    clickRate: number;
    views: number;
    moneySpent: number;
    adminMessage: string;
    events: Array<Event>;
    loads: Array<Load>;
}

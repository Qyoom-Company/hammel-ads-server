import mongoose from "mongoose";
import { EventType } from "./EventType";
export default interface Event {
    type: EventType;
    campaignId: String;
    userId: String;
    deviceId: Number;
    placementId: String;
    watchTimeStart: Number | null;
    watchTimeEnd: Number | null;
    watchTime: Number | null;
}

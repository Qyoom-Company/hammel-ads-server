import * as mongoose from "mongoose";
import Event from "../types/event";
import { EventType } from "../types/event/EventType";

const eventSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: Object.values(EventType),
        required: true,
    },
    campaignId: {
        type: String,
        required: true,
    },
    userId: {
        type: String,
        required: true,
    },
    deviceId: {
        type: String,
        required: true,
    },
    placementId: {
        type: String,
        required: true,
    },
    watchTimeStart: {
        type: Number,
        default: null,
    },
    watchTimeEnd: {
        type: Number,
        default: null,
    },
    watchTime: {
        type: Number,
        default: null,
    },
});

const Event = mongoose.model<Event & mongoose.Document>("Event", eventSchema);

export default Event;

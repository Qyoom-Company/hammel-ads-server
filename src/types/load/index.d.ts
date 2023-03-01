import mongoose from "mongoose";
import { LoadStatus } from "./LoadStatus";
export default interface Load {
    deviceId: string;
    placementId: string;
    status: LoadStatus;
    createdAt: Date;
}

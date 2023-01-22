import * as mongoose from "mongoose";
import jwt, { Secret } from "jsonwebtoken";
import IUser from "../types/user";
const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

userSchema.methods.generateAuthToken = function (): string {
    const token = jwt.sign(
        { _id: this._id },
        process.env.JWT_PRIVATE_KEY as Secret
    );
    return token;
};

const User = mongoose.model<IUser & mongoose.Document>("User", userSchema);

export default User;

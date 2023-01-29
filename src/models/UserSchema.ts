import * as mongoose from "mongoose";
import jwt, { Secret } from "jsonwebtoken";
import IUser from "../types/user/";
import { UserType } from "../types/user/UserType";
import crypto from "crypto";
import { sendConfirmationEmail } from "../services/email";

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    photoPath: { type: String, default: null },
    userType: {
        type: String,
        default: UserType.User,
        enum: Object.values(UserType),
    },
    isEmailConfirmed: {
        type: Boolean,
        default: false,
    },
    confirmationToken: {
        type: String,
        default: null,
    },
    resetToken: {
        type: String,
        default: null,
    },
    resetTokenExpiration: {
        type: Date,
        default: null,
    },
});

const generateConfirmationToken = () => {
    return crypto.randomBytes(20).toString("hex");
};

userSchema.methods.generateAuthToken = function (): string {
    const token = jwt.sign(
        { _id: this._id },
        process.env.JWT_PRIVATE_KEY as Secret
    );
    return token;
};

userSchema.pre("save", function (next) {
    if (this.isModified("email")) {
        this.confirmationToken = generateConfirmationToken();
        sendConfirmationEmail(this.confirmationToken, this.email);
    }
    next();
});

const User = mongoose.model<IUser & mongoose.Document>("User", userSchema);

export default User;

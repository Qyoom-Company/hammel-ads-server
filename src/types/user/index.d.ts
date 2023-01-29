import mongoose from "mongoose";
import { UserType } from "./UserType";
export default interface IUser {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    password: string;
    photoPath: string | null;
    isEmailConfirmed: Boolean;
    confirmationToken: string | null;
    resetToken: string | null;
    resetTokenExpiration: Date | null;
    userType: UserType;
    userId: string;
    generateAuthToken: () => string;
    generateConfirmationToken: () => string;
}

import mongoose from "mongoose";
import { UserType } from "./UserType";
interface CardInfo {
    number: string;
    expiryMonth: string;
    expiryYear: string;
    brand: string;
    issuer: string;
}
export default interface UserPaymentMethodType {
    token: string;
    cardInfo: {
        number: string;
        expiryMonth: string;
        expiryYear: string;
        brand: string;
        issuer: string;
    };
}

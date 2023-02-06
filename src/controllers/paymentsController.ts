import axios, { Axios } from "axios";
import { ValidationError, validationResult } from "express-validator";
import { Request, Response } from "express";
import { request } from "https";
import User from "../models/UserSchema";
import { ValidationResult } from "../types/validation";
class PaymentsController {
    static executeDirectPayment = async (req: any, res: any) => {
        try {
            const validationResults = validationResult(
                req
            ) as unknown as ValidationResult;
            const errors: ValidationError[] =
                (validationResults?.errors as ValidationError[]) || [];
            if (errors.length > 0) {
                return res.status(400).json({
                    status: "error",
                    message: `invalid ${errors[0]?.param} : ${errors[0]?.value}`,
                });
            }
            const { amount, cardDetails } = req.body;

            if (
                !cardDetails.Number ||
                !cardDetails.ExpiryMonth ||
                !cardDetails.ExpiryYear ||
                !cardDetails.SecurityCode ||
                !cardDetails.HolderName
            ) {
                return res.status(400).json({
                    status: "error",
                    message: "invalid card details",
                });
            }

            const directPaymentLink: any = await this.getDirectPaymentLink(
                amount
            );
            const response: any = await this.directPayment(
                directPaymentLink,
                cardDetails
            );

            if (response.data.IsSuccess) {
                const user = await User.findById(req?.currentUser?._id);
                if (!user)
                    return res
                        .status(500)
                        .json({
                            status: "error",
                            message: "internal server error",
                        });
                user.balance = user.balance + Number(amount);
                await user.save();
                return res.status(200).json({
                    isSuccess: true,
                    status: "success",
                    message: "payment successful",
                });
            }

            return res.status(400).status({
                isSuccess: false,
                status: "error",
                message: "payment failed",
            });
        } catch (err) {
            return res.status(500).status({
                isSuccess: false,
                status: "error",
                message: "internal server error",
            });
        }
    };

    static adminIncreaseUserBalance = async (req: Request, res: Response) => {
        try {
            const validationResults = validationResult(
                req
            ) as unknown as ValidationResult;
            const errors: ValidationError[] =
                (validationResults?.errors as ValidationError[]) || [];
            if (errors.length > 0) {
                return res.status(400).json({
                    status: "error",
                    message: `invalid ${errors[0]?.param} : ${errors[0]?.value}`,
                });
            }

            if (!req?.currentUser?.isAdmin) {
                return res.status(401).json({
                    status: "error",
                    message: "unauthorized access",
                });
            }
            const amount = Number(req.body.amount);
            const userEmail = req.body.userEmail;

            const user = await User.findOne({ email: userEmail });
            if (!user) {
                return res.status(404).json({
                    status: "error",
                    message: "user not found",
                });
            }
            user.balance = user.balance + amount;
            await user.save();
            res.status(200).json({
                status: "success",
                message: "user balance increased",
            });
        } catch (err) {
            res.status(500).json({
                status: "error",
                message: "internal server error",
            });
        }
    };

    private static getDirectPaymentLink = async (amount: number) => {
        return new Promise((resolve, reject) => {
            axios
                .post(
                    `${process.env.MYFATOORAH_TEST_API_LINK}ExecutePayment`,
                    {
                        PaymentMethodId: 20,
                        invoiceValue: amount,
                    },
                    {
                        headers: {
                            Authorization:
                                "Bearer " + process.env.MYFATOORAH_DEMO_API_KEY,
                        },
                    }
                )
                .then((res) => {
                    if (res?.data?.Data?.PaymentURL)
                        resolve(res.data.Data.PaymentURL);
                    else reject({ status: "error", message: res.data.Message });
                })
                .catch((err) => reject(err));
        });
    };
    private static directPayment = async (
        directPaymentLink: string,
        cardObject: any
    ) => {
        return new Promise((resolve, reject) => {
            axios
                .post(
                    directPaymentLink,
                    {
                        PaymentType: "card",
                        SaveToken: true,
                        Card: cardObject,
                        //   "Token": "string",
                        Bypass3DS: true,
                    },
                    {
                        headers: {
                            Authorization:
                                "Bearer " + process.env.MYFATOORAH_DEMO_API_KEY,
                        },
                    }
                )
                .then((res) => resolve(res))
                .catch((err) => reject(err));
        });
    };
}

export default PaymentsController;

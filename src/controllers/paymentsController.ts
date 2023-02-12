import axios, { Axios } from "axios";
import { ValidationError, validationResult } from "express-validator";
import { Request, Response } from "express";
import User from "../models/UserSchema";
import { ValidationResult } from "../types/validation";
import UserPaymentMethodType from "../types/payment method";
class PaymentsController {
    static getAllPaymentMethods = async (req: any, res: any) => {
        const user = await User.findById(req?.currentUser?._id);
        if (!user)
            return res
                .status(500)
                .json({ status: "error", message: "internal server error" });
        return res
            .status(200)
            .json({ status: "success", data: user.paymentMethods });
    };

    static removeOnePaymentMethod = async (req: any, res: any) => {
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

            const { token } = req.body;

            const user = await User.findById(req?.currentUser?._id);
            if (!user)
                return res.status(500).json({
                    status: "error",
                    message: "internal server error",
                });

            const filteredPaymentMethods = user.paymentMethods.filter(
                (paymentMethod: UserPaymentMethodType) =>
                    paymentMethod.token !== token
            );
            if (filteredPaymentMethods.length === user.paymentMethods.length) {
                return res
                    .status(400)
                    .json({ status: "error", message: "invalid token" });
            }
            user.paymentMethods = filteredPaymentMethods;

            await user.save();

            res.status(200).json({
                status: "success",
                message: "payment method removed successfully",
            });
        } catch (err) {
            return res
                .status(500)
                .json({ status: "error", message: "internal server error" });
        }
    };

    static executeDirectPaymentUsingToken = async (req: any, res: any) => {
        try {
            // add check for token
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

            const { amount, token } = req.body;

            const user = await User.findById(req?.currentUser?._id);
            if (
                !user ||
                !(
                    user.paymentMethods.filter(
                        (paymentMethod) => paymentMethod.token === token
                    ).length > 0
                )
            ) {
                return res.status(404).json({
                    status: "error",
                    message: "invalid token used for transaction",
                });
            }

            const directPaymentLink: any = await this.getDirectPaymentLink(
                amount
            );
            const response: any = await this.directPaymentUsingToken(
                directPaymentLink,
                token
            );

            if (response?.data?.IsSuccess) {
                user.balance = user.balance + Number(amount);
                await user.save();
                return res.status(200).json({
                    isSuccess: true,
                    status: "success",
                    message: "payment successful",
                });
            }
            console.log("errrrrorrrrr", response);
            return res.status(400).json({
                isSuccess: false,
                status: "error",
                message: "payment failed",
            });
        } catch (err) {
            return res.status(500).json({
                isSuccess: false,
                status: "error",
                message: "internal server error",
            });
        }
    };

    static executeNewDirectPayment = async (req: any, res: any) => {
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
            const user = await User.findById(req?.currentUser?._id);
            if (!user)
                return res.status(500).json({
                    status: "error",
                    message: "internal server error",
                });

            if (
                user.paymentMethods.filter(
                    (paymentMethod) =>
                        paymentMethod.cardInfo.number.substring(
                            paymentMethod.cardInfo.number.length - 4
                        ) ===
                        cardDetails.Number.substring(
                            cardDetails.Number.length - 4
                        )
                ).length !== 0
            ) {
                return res.status(400).json({
                    status: "error",
                    message: "payment method already exists",
                });
            }

            const directPaymentLink: any = await this.getDirectPaymentLink(
                amount
            );
            const response: any = await this.directPaymentUsingCard(
                directPaymentLink,
                cardDetails
            );
            if (response?.data?.IsSuccess) {
                user.balance = user.balance + Number(amount);

                user.paymentMethods = [
                    ...user.paymentMethods,
                    {
                        token: response.data.Data.Token,
                        cardInfo: {
                            number: response.data.Data.CardInfo.Number,
                            expiryMonth:
                                response.data.Data.CardInfo.ExpiryMonth,
                            expiryYear: response.data.Data.CardInfo.ExpiryYear,
                            brand: response.data.Data.CardInfo.Brand,
                            issuer: response.data.Data.CardInfo.Issuer,
                        },
                    },
                ];

                await user.save();
                return res.status(200).json({
                    isSuccess: true,
                    status: "success",
                    message: "payment successful",
                });
            }
            console.log(response);

            return res.status(400).json({
                isSuccess: false,
                status: "error",
                message: "payment failed",
            });
        } catch (err) {
            console.log(err);
            return res.status(500).json({
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
    private static directPaymentUsingCard = async (
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
                .catch((err) => resolve(err));
        });
    };

    private static directPaymentUsingToken = async (
        directPaymentLink: string,
        token: string
    ) => {
        return new Promise((resolve, reject) => {
            axios
                .post(
                    directPaymentLink,
                    {
                        PaymentType: "token",
                        Token: token,
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
                .catch((err) => resolve(err));
        });
    };
}

export default PaymentsController;

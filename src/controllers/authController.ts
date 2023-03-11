import { Request, Response } from "express";
import bcrypt from "bcrypt";
import UserSchema from "../models/UserSchema";
import { validationResult } from "express-validator";
import { ValidationError, ValidationResult } from "../types/validation";
import { sendPasswordResetEmail } from "../services/email";
import crypto from "crypto";
import User from "../models/UserSchema";
class AuthController {
    static register = async (req: Request, res: Response) => {
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

            const {
                firstName,
                lastName,
                email,
                phoneNumber,
                password,
                preferredLanguage,
            } = req.body;

            const user = new UserSchema({
                firstName,
                lastName,
                email,
                phoneNumber,
                password,
                preferredLanguage,
            });
            user.password = await bcrypt.hash(password, 10);
            await user.save();
            const token = user.generateAuthToken();
            res.status(200).json({
                status: "success",
                data: {
                    token,
                },
            });
        } catch (err: any) {
            if (err?.keyValue) {
                return res.status(400).json({
                    status: "error",
                    message: `${Object.keys(err.keyValue)[0]} already in use`,
                });
            }
            console.log(err);

            res.status(500).json({
                status: "error",
                message: "internal server error",
            });
        }
    };
    static login = async (req: Request, res: Response) => {
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

            const { email, password } = req.body;
            const user = await UserSchema.findOne({ email });
            if (!user) {
                return res.status(404).json({
                    status: "error",
                    message: "User not found",
                });
            }

            const valid = await bcrypt.compare(password, user.password);
            if (!valid) {
                return res.status(401).json({
                    status: "error",
                    message: "Invalid password",
                });
            }
            const token = user.generateAuthToken();
            res.status(200).json({
                status: "success",
                data: {
                    token,
                },
            });
        } catch (err: any) {
            res.status(500).json({
                status: "error",
                message: "internal server error",
            });
        }
    };
    static confirmEmail = async (req: Request, res: Response) => {
        try {
            const { token } = req.params;
            const user = await UserSchema.findOne({ confirmationToken: token });
            if (!user) {
                res.status(400).json({
                    status: "error",
                    message: "invalid confirmation token",
                });
            } else {
                user.isEmailConfirmed = true;
                user.confirmationToken = null;

                await user.save();

                const token = user.generateAuthToken();
                res.status(200).json({
                    status: "success",
                    message: "email has been verified successfully",
                    data: {
                        token,
                    },
                });
            }
        } catch (err: any) {
            res.status(500).json({
                status: "error",
                message: "internal server error",
            });
        }
    };

    static resetPassword = async (req: Request, res: Response) => {
        try {
            const { email } = req.body;
            const user = await UserSchema.findOne({ email: email });
            if (!user) {
                res.status(404).json({
                    status: "error",
                    message: "no user found with that email address",
                });
            } else {
                // create a random token
                const resetToken = crypto.randomBytes(20).toString("hex");
                user.resetToken = resetToken;
                user.resetTokenExpiration = new Date(Date.now() + 3600000);
                await user.save();
                // Send email to user with the reset link
                await sendPasswordResetEmail(resetToken, user?.email);
                res.status(200).json({
                    status: "success",
                    message: "email sent.",
                });
            }
        } catch (err: any) {
            res.status(500).json({
                status: "error",
                message: "internal server error",
            });
        }
    };

    static newPassword = async (req: Request, res: Response) => {
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

            const { resetToken, newPassword } = req.body;

            const user = await User.findOne({
                resetToken: resetToken,
                resetTokenExpiration: { $gt: Date.now() },
            });

            if (!user) {
                return res
                    .status(404)
                    .json({ status: "error", message: "Invalid Token" });
            }

            const sameAsPrevious = await bcrypt.compare(
                newPassword,
                user.password
            );

            if (sameAsPrevious) {
                return res.status(400).json({
                    status: "error",
                    message: `cannot use previous password`,
                });
            }

            console.log(sameAsPrevious);
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            user.password = hashedPassword;
            user.resetToken = null;
            user.resetTokenExpiration = null;
            const token = user.generateAuthToken();
            await user.save();
            return res.status(200).json({
                status: "success",
                message: "password updated",
                data: {
                    token,
                },
            });
        } catch (err: any) {
            res.status(500).json({
                status: "error",
                message: "internal server error",
            });
        }
    };
    static verifyToken = async (req: Request, res: Response) => {
        try {
            const validationResults = validationResult(
                req
            ) as unknown as ValidationResult;
            const errors: ValidationError[] =
                (validationResults?.errors as ValidationError[]) || [];
            if (errors.length > 0) {
                return res.status(400).json({
                    status: "error",
                    message: `invalid token`,
                });
            }

            const { resetToken } = req.body;

            const user = await User.findOne({
                resetToken: resetToken,
                resetTokenExpiration: { $gt: Date.now() },
            });

            if (!user) {
                return res
                    .status(404)
                    .json({ status: "error", message: "Invalid Token" });
            }

            return res.status(200).json({
                status: "success",
                message: "token is valid",
            });
        } catch (err: any) {
            res.status(500).json({
                status: "error",
                message: "internal server error",
            });
        }
    };
}

export default AuthController;

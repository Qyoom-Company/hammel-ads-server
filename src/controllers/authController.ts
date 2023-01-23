import { Request, Response } from "express";
import bcrypt from "bcrypt";
import UserSchema from "../models/UserSchema";
import { validationResult } from "express-validator";
import { ValidationError, ValidationResult } from "../types/validation";
import { sendPasswordResetEmail } from "../services/email";

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

            const { firstName, lastName, email, phoneNumber, password } =
                req.body;

            const user = new UserSchema({
                firstName,
                lastName,
                email,
                phoneNumber,
                password,
            });
            user.password = await bcrypt.hash(password, 10);
            await user.save();
            const token = user.generateAuthToken();
            res.status(200).json({ status: "success", token });
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
            const data = {
                email,
                password,
            };
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
            res.status(200).json({ status: "success", token });
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
                res.status(200).json({
                    status: "success",
                    message: "email has been verified successfully",
                });
            }
        } catch (err: any) {
            res.status(500).json({
                status: "error",
                message: "internal server error",
            });
        }
    };

    static forgotPassword = async (req: Request, res: Response) => {
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
            const { email } = req.body;
            const user = await UserSchema.findOne({ email: email });
            if (!user) {
                res.status(404).json({
                    status: "error",
                    message: "no user found with that email address",
                });
            }

            // await sendPasswordResetEmail()

            res.status(200).json({
                status: "success",
                message: "email sent.",
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

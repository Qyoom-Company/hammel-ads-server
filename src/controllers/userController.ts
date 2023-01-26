import { Request, Response } from "express";
import bcrypt from "bcrypt";
import UserSchema from "../models/UserSchema";
import { validationResult } from "express-validator";
import { ValidationError, ValidationResult } from "../types/validation";
import { sendPasswordResetEmail } from "../services/email";
import crypto from "crypto";
import User from "../models/UserSchema";
class UserController {
    static getUserInfo = async (req: Request, res: Response) => {
        try {
            if (req.currentUser?.isEmailConfirmed === false) {
                return res.status(401).json({
                    status: "error",
                    message: "email not confirmed",
                });
            } else {
                return res.status(200).json({
                    status: "success",
                    message: "user fetched",
                    data: {
                        user: {
                            _id: req.currentUser?._id,
                            firstName: req.currentUser?.firstName,
                            lastName: req.currentUser?.lastName,
                            email: req.currentUser?.email,
                            phoneNumber: req.currentUser?.phoneNumber,
                        },
                    },
                });
            }
        } catch (err) {}
    };
}

export default UserController;

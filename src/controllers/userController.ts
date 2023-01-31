import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { ValidationError, ValidationResult } from "../types/validation";
import crypto from "crypto";
import path from "path";
import User from "../models/UserSchema";
import MediaController from "./mediaController";
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
                            photoPath: req.currentUser?.photoPath,
                        },
                    },
                });
            }
        } catch (err) {
            console.log(err);
        }
    };
    static updateUser = async (req: Request, res: Response) => {
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

            const userData = req.body;

            // const isMatch = await bcrypt.compare(
            //     userData.currentPassword,
            //     req.currentUser?.password || ""
            // );

            // if (!isMatch) {
            //     return res.status(401).json({
            //         status: "error",
            //         message: "incorrect currentPassword",
            //     });
            // }

            // userData.password = await bcrypt.hash(userData.password, 10);

            // const user = await User.findByIdAndUpdate(req.currentUser?._id, {
            //     ...userData,
            //     // currentPassword: null,
            // });

            const user = await User.findByIdAndUpdate(req.currentUser?._id, {
                firstName: userData.firstName,
                lastName: userData.lastName,
                phoneNumber: userData.phoneNumber,
            });

            res.status(200).json({
                status: "success",
                data: {
                    user: {
                        _id: user?._id,
                        firstName: userData.firstName,
                        lastName: userData.lastName,
                        email: userData.email,
                        phoneNumber: userData.phoneNumber,
                    },
                },
            });
        } catch (err: any) {
            if (err?.keyValue) {
                return res.status(400).json({
                    status: "error",
                    message: `${
                        Object.keys(err.keyValue)[0]
                    } already in use by another user`,
                });
            }
            console.log(err);

            res.status(500).json({
                status: "error",
                message: "internal server error",
            });
        }
    };

    static uploadProfilePhoto = async (req: Request, res: Response) => {
        try {
            // @ts-ignore
            const file = req.files?.profilePhoto;
            if (!file) {
                return res
                    .status(400)
                    .json({ status: "error", message: "no file selected!" });
            }
            const extention = path.parse(file.name).ext;
            if (!file.mimetype.startsWith("image")) {
                return res.status(400).json({
                    status: "error",
                    message: "invalid file type",
                });
            }
            const filename = await MediaController.saveFile(file);
            await User.findByIdAndUpdate(req.currentUser?._id, {
                photoPath: `http://localhost:3500/uploads/${filename}${extention}`,
            });
            return res.status(200).json({
                status: "success",
                message: "photo uploaded",
                data: {
                    photoPath: `http://localhost:3500/uploads/${filename}${extention}`,
                },
            });
        } catch (err: any) {
            console.log(err);

            return res.status(500).json({
                status: "error",
                message: "internal server error",
            });
        }
    };
    static removeProfilePhoto = async (req: Request, res: Response) => {
        try {
            await User.findByIdAndUpdate(req.currentUser?._id, {
                photoPath: null,
            });

            res.status(200).json({
                status: "success",
                message: "profile photo removed",
            });
        } catch (err: any) {
            console.log(err);

            res.status(500).json({
                status: "error",
                message: "internal server error",
            });
        }
    };
}

export default UserController;

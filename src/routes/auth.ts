import express from "express";
import userSchema from "../models/UserSchema";
import bcrypt from "bcrypt";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import UserSchema from "../models/UserSchema";

const router = express.Router();

router.post("/register", async (req, res) => {
    try {
        const { firstName, lastName, email, phoneNumber, password } = req.body;
        const data = {
            firstName,
            lastName,
            email,
            phoneNumber,
            password,
        };

        let missingFields = Object.keys(data).filter(
            // @ts-ignore
            (key) => data[key] === undefined
        );
        if (missingFields.length > 0) {
            if (missingFields.length === 1) {
                return res.status(400).json({
                    status: "error",
                    message: `${missingFields[0]} field is required`,
                });
            } else {
                return res.status(400).json({
                    status: "error",
                    message: `${missingFields.join(", ")} fields are required`,
                });
            }
        }

        const user = new userSchema({
            firstName,
            lastName,
            email,
            phoneNumber,
            password,
        });
        user.password = await bcrypt.hash(password, 10);
        await user.save();
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_PRIVATE_KEY as Secret
        );
        res.status(200).json({ status: "success", token });
    } catch (err: any) {
        if (err?.keyValue) {
            return res.status(400).json({
                status: "error",
                message: `${Object.keys(err.keyValue)[0]} already in use`,
            });
        }

        res.status(500).json({
            status: "error",
            message: "internal server error",
        });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const data = {
            email,
            password,
        };

        let missingFields = Object.keys(data).filter(
            // @ts-ignore
            (key) => data[key] === undefined
        );
        if (missingFields.length > 0) {
            if (missingFields.length === 1) {
                return res.status(400).json({
                    status: "error",
                    message: `${missingFields[0]} field is required`,
                });
            } else {
                return res.status(400).json({
                    status: "error",
                    message: `${missingFields.join(
                        " and "
                    )} fields are required`,
                });
            }
        }
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
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_PRIVATE_KEY as Secret
        );
        res.status(200).json({ status: "success", token });
    } catch (err: any) {
        res.status(500).json({
            status: "error",
            message: "internal server error",
        });
    }
});

export default router;

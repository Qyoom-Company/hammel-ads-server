import express from "express";
import { body } from "express-validator";
import AuthController from "../controllers/authController";

const router = express.Router();

router.post(
    "/register",
    body("firstName").isLength({ min: 3, max: 20 }),
    body("lastName").isLength({ min: 3, max: 20 }),
    body("email").isEmail(),
    body("password").isStrongPassword({ minLength: 8 }),
    body("phoneNumber").isMobilePhone(["ar-SA", "en-US", "ar-TN"]),
    AuthController.register
);

router.post(
    "/login",
    body("email").isEmail(),
    body("password").isStrongPassword({ minLength: 8 }),
    AuthController.login
);

export default router;

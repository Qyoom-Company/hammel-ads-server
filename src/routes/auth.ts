import express from "express";
import { MemoryStore, rateLimit } from "express-rate-limit";
import { body } from "express-validator";
import AuthController from "../controllers/authController";

// rate limiter
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    store: new MemoryStore(),
});
const router = express.Router();

router.post(
    "/register",
    limiter,
    body("firstName").isLength({ min: 3, max: 20 }),
    body("lastName").isLength({ min: 3, max: 20 }),
    body("email").isEmail(),
    body("password").isStrongPassword({ minLength: 8 }),
    body("phoneNumber").isMobilePhone(["ar-SA", "en-US", "ar-TN"]),
    AuthController.register
);

router.post(
    "/login",
    limiter,
    body("email").isEmail(),
    body("password").isStrongPassword({ minLength: 8 }),
    AuthController.login
);

export default router;

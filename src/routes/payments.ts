import express from "express";
import authMiddleware from "../middlewares/Auth";

import PaymentsController from "../controllers/paymentsController";
import { body } from "express-validator";
const router = express.Router();

router.post(
    "/directpayment",
    authMiddleware.validate,
    body("amount").isNumeric(),
    body("cardDetails").notEmpty(),
    PaymentsController.executeDirectPayment
);

router.post(
    "/increase-balance",
    authMiddleware.validate,
    body("userEmail").isEmail(),
    body("amount").isNumeric(),
    PaymentsController.adminIncreaseUserBalance
);

export default router;

import express from "express";
import authMiddleware from "../middlewares/Auth";

import PaymentsController from "../controllers/paymentsController";
import { body } from "express-validator";
const router = express.Router();

router.post(
    "/newdirectpayment",
    authMiddleware.validate,
    body("amount").isNumeric(),
    body("cardDetails").notEmpty(),
    PaymentsController.executeNewDirectPayment
);
router.post(
    "/directpayment",
    authMiddleware.validate,
    body("amount").isNumeric(),
    body("token").notEmpty(),
    PaymentsController.executeDirectPaymentUsingToken
);

router.get(
    "/paymentmethods",
    authMiddleware.validate,
    PaymentsController.getAllPaymentMethods
);

router.delete(
    "/paymentmethods",
    authMiddleware.validate,
    body("token").notEmpty(),
    PaymentsController.removeOnePaymentMethod
);

router.post(
    "/increase-balance",
    authMiddleware.validate,
    body("userEmail").isEmail(),
    body("amount").isNumeric(),
    PaymentsController.adminIncreaseUserBalance
);

export default router;

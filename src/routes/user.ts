import express, { Request, Response } from "express";
import { body } from "express-validator";
import multer from "multer";
import userController from "../controllers/userController";
import authMiddleware from "../middlewares/Auth";
import fileUpload from "express-fileupload";
const router = express.Router();

// const upload = multer({ dest: "uploads/" });
router.use(fileUpload({ createParentPath: false }));

router.get("/getuser", authMiddleware.validate, userController.getUserInfo);
router.post(
    "/updateuser",
    authMiddleware.validate,
    body("firstName").isLength({ min: 3, max: 20 }),
    body("lastName").isLength({ min: 3, max: 20 }),
    body("email").isEmail(),
    body("currentPassword").notEmpty(),
    body("password").isStrongPassword({ minLength: 8 }),
    body("phoneNumber").isMobilePhone(["ar-SA", "en-US", "ar-TN"]),
    userController.updateUser
);

router.post(
    "/upload-photo",
    authMiddleware.validate,
    userController.uploadProfilePhoto
);

export default router;

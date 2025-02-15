import express from "express";
import { AuthController } from "../controllers/auth";
import { authenticateToken } from "../middlewares/auth";

const router = express.Router();

router.post("/login", AuthController.login);
router.post(
  "/changePassword",
  authenticateToken,
  AuthController.changePassword,
);

router.post("/forgotPassword", AuthController.forgotPassword);
router.post("/resetPassword", AuthController.validateOtpAndResetPassword);
router.post("/logout", authenticateToken, AuthController.logout);

export default router;

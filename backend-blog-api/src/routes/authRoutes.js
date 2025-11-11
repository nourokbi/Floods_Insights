import express from "express";
import authController from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import validationMiddleware from "../middleware/validationMiddleware.js";
import authValidation from "../validations/authValidation.js";

const router = express.Router();

// تسجيل مستخدم جديد
router.post(
  "/register",
  validationMiddleware.validate(authValidation.register),
  authController.register
);

// تسجيل الدخول
router.post(
  "/login",
  validationMiddleware.validate(authValidation.login),
  authController.login
);

// الحصول على بيانات المستخدم الحالي (تحتاج مصادقة)
router.get("/me", authMiddleware.authenticateToken, authController.getMe);

// تحديث بيانات المستخدم (تحتاج مصادقة)
router.put(
  "/profile",
  authMiddleware.authenticateToken,
  authController.updateProfile
);

export default router;

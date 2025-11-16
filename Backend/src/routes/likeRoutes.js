import express from "express";
import likesController from "../controllers/likesController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import validationMiddleware from "../middleware/validationMiddleware.js";
import likeValidation from "../validations/likeValidation.js";

const router = express.Router();

// 🔐 جميع مسارات الإعجابات تحتاج مصادقة
router.use(authMiddleware.authenticateToken);

// تبديل حالة الإعجاب (إضافة/إزالة)
router.post(
  "/toggle",
  validationMiddleware.validate(likeValidation.toggle),
  likesController.toggleLike
);

// الحصول على الإعجابات للمستخدم الحالي
router.get("/my", likesController.getMyLikes);

// التحقق من إذا كان التقرير معجب به
router.get("/check/:report_id", likesController.checkLikeStatus);

// الحصول على عدد الإعجابات لتقرير محدد
router.get("/count/:report_id", likesController.getLikesCount);

// الحصول على قائمة المعجبين بتقرير محدد
router.get("/list/:report_id", likesController.getLikesList);

export default router;

import express from "express";
import bookmarksController from "../controllers/bookmarksController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import validationMiddleware from "../middleware/validationMiddleware.js";
import bookmarkValidation from "../validations/bookmarkValidation.js";

const router = express.Router();

// 🔐 جميع مسارات الإشارات المرجعية تحتاج مصادقة
router.use(authMiddleware.authenticateToken);

// تبديل حالة الإشارة المرجعية (إضافة/إزالة)
router.post(
  "/toggle",
  validationMiddleware.validate(bookmarkValidation.toggle),
  bookmarksController.toggleBookmark
);

// الحصول على الإشارات المرجعية للمستخدم الحالي
router.get("/my", bookmarksController.getMyBookmarks);

// التحقق من إذا كان التقرير مضاف إلى الإشارات المرجعية
router.get("/check/:report_id", bookmarksController.checkBookmarkStatus);

// الحصول على عدد الإشارات المرجعية لتقرير محدد
router.get("/count/:report_id", bookmarksController.getBookmarksCount);

export default router;

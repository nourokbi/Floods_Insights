import express from "express";
import commentsController from "../controllers/commentsController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import validationMiddleware from "../middleware/validationMiddleware.js";
import commentValidation from "../validations/commentValidation.js";

const router = express.Router();

// 🔐 جميع مسارات التعليقات تحتاج مصادقة
router.use(authMiddleware.authenticateToken);

// إضافة تعليق جديد
router.post(
  "/",
  validationMiddleware.validate(commentValidation.create),
  commentsController.addComment
);

// الحصول على تعليقات تقرير محدد
router.get("/report/:report_id", commentsController.getCommentsByReport);

// تحديث تعليق
router.put(
  "/:id",
  validationMiddleware.validate(commentValidation.update),
  commentsController.updateComment
);

// حذف تعليق
router.delete("/:id", commentsController.deleteComment);

// الحصول على تعليقات المستخدم الحالي
router.get("/my/comments", commentsController.getMyComments);

export default router;

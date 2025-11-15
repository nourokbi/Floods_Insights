import express from "express";
import reportsController from "../controllers/reportsController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import validationMiddleware from "../middleware/validationMiddleware.js";
import reportValidation from "../validations/reportValidation.js";
import { upload, handleUploadErrors } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// 🔓 المسارات العامة (لا تحتاج مصادقة)
router.get("/", reportsController.getReports);

router.get("/:id", reportsController.getReportById);

router.get(
  "/nearby/search",
  validationMiddleware.validate(reportValidation.nearby, "query"),
  reportsController.getNearbyReports
);

router.get("/stats/summary", reportsController.getReportsStats);

// 🔐 المسارات المحمية (تحتاج مصادقة)
router.use(authMiddleware.authenticateToken);

// 📝 المسارات التي تحتاج صلاحيات أدمن فقط
router.post(
  "/",
  authMiddleware.requireAdmin,
  upload.array("images", 5),
  handleUploadErrors,
  validationMiddleware.validate(reportValidation.create),
  reportsController.createReport
);

router.put(
  "/:id",
  authMiddleware.requireAdmin,
  upload.array("images", 5),
  handleUploadErrors,
  validationMiddleware.validate(reportValidation.update),
  reportsController.updateReport
);

router.delete(
  "/:id",
  authMiddleware.requireAdmin,
  reportsController.deleteReport
);

// ⭐ الجديد: مسار لحذف صورة معينة من التقرير
router.delete(
  "/:id/images/:imageIndex",
  authMiddleware.requireAdmin,
  reportsController.deleteReportImage
);

// 👤 المسارات الخاصة بالمستخدم الحالي
router.get(
  "/my/reports",
  authMiddleware.requireAdmin,
  reportsController.getMyReports
);

export default router;

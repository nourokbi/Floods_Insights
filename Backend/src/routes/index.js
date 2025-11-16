import express from "express";
import authRoutes from "./authRoutes.js";

const router = express.Router();

// مسارات المصادقة
router.use("/auth", authRoutes);

// route للتحقق من صحة الخادم
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🚀 Server is running successfully!",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

export default router;

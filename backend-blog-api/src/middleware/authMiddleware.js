import tokenUtils from "../utils/tokenUtils.js";

const authMiddleware = {
  // التحقق من التوكن
  authenticateToken: (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

      if (!token) {
        return res.status(401).json({
          success: false,
          message: "الوصول مرفوض. لا يوجد token",
        });
      }

      const decoded = tokenUtils.verifyToken(token);
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(403).json({
        success: false,
        message: "Token غير صالح",
      });
    }
  },

  // التحقق من صلاحية الأدمن فقط
  requireAdmin: (req, res, next) => {
    if (req.user && req.user.role === "admin") {
      next();
    } else {
      return res.status(403).json({
        success: false,
        message: "الوصول مرفوض. تحتاج صلاحيات أدمن",
      });
    }
  },

  // التحقق من صلاحية المستخدم أو الأدمن
  requireUserOrAdmin: (req, res, next) => {
    if (req.user && (req.user.role === "user" || req.user.role === "admin")) {
      next();
    } else {
      return res.status(403).json({
        success: false,
        message: "الوصول مرفوض. تحتاج تسجيل الدخول",
      });
    }
  },
};

export default authMiddleware;

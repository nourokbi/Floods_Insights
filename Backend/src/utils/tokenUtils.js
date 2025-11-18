import jwt from "jsonwebtoken";

const tokenUtils = {
  // إنشاء JWT token
  generateToken(user) {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });
  },

  // التحقق من JWT token
  verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new Error("Token غير صالح");
    }
  },

  // استخراج البيانات من Token بدون التحقق (للاستخدام في middleware)
  decodeToken(token) {
    try {
      return jwt.decode(token);
    } catch (error) {
      return null;
    }
  },
};

export default tokenUtils;

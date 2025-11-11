import { User } from "../models/index.js";
import passwordUtils from "../utils/passwordUtils.js";
import tokenUtils from "../utils/tokenUtils.js";

const authController = {
  // تسجيل مستخدم جديد
  async register(req, res) {
    try {
      const { name, email, password, role } = req.body;

      // التحقق من عدم وجود مستخدم بنفس البريد الإلكتروني
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "البريد الإلكتروني مستخدم مسبقاً",
        });
      }

      // التحقق من قوة كلمة المرور
      const passwordValidation =
        passwordUtils.validatePasswordStrength(password);
      if (!passwordValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: passwordValidation.message,
        });
      }

      // تشفير كلمة المرور
      const hashedPassword = await passwordUtils.hashPassword(password);

      // إنشاء المستخدم
      const userData = {
        name,
        email,
        password: hashedPassword,
        role: role || "user",
      };

      const user = await User.create(userData);

      // إنشاء token
      const token = tokenUtils.generateToken(user);

      // إرجاع الاستجابة بدون كلمة المرور
      const userResponse = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        created_at: user.created_at,
      };

      res.status(201).json({
        success: true,
        message: "تم إنشاء الحساب بنجاح",
        data: {
          user: userResponse,
          token,
        },
      });
    } catch (error) {
      console.error("خطأ في التسجيل:", error);
      res.status(500).json({
        success: false,
        message: "حدث خطأ أثناء إنشاء الحساب",
      });
    }
  },

  // تسجيل الدخول
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // البحث عن المستخدم
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
        });
      }

      // التحقق من كلمة المرور
      const isPasswordValid = await passwordUtils.verifyPassword(
        password,
        user.password
      );
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
        });
      }

      // إنشاء token
      const token = tokenUtils.generateToken(user);

      // إرجاع الاستجابة بدون كلمة المرور
      const userResponse = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        created_at: user.created_at,
      };

      res.json({
        success: true,
        message: "تم تسجيل الدخول بنجاح",
        data: {
          user: userResponse,
          token,
        },
      });
    } catch (error) {
      console.error("خطأ في تسجيل الدخول:", error);
      res.status(500).json({
        success: false,
        message: "حدث خطأ أثناء تسجيل الدخول",
      });
    }
  },

  // الحصول على بيانات المستخدم الحالي
  async getMe(req, res) {
    try {
      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "المستخدم غير موجود",
        });
      }

      res.json({
        success: true,
        data: {
          user,
        },
      });
    } catch (error) {
      console.error("خطأ في جلب بيانات المستخدم:", error);
      res.status(500).json({
        success: false,
        message: "حدث خطأ أثناء جلب بيانات المستخدم",
      });
    }
  },

  // تحديث بيانات المستخدم
  async updateProfile(req, res) {
    try {
      const { name } = req.body;
      const userId = req.user.id;

      const updateData = {};
      if (name) updateData.name = name;

      const updatedUser = await User.update(userId, updateData);

      res.json({
        success: true,
        message: "تم تحديث البيانات بنجاح",
        data: {
          user: updatedUser,
        },
      });
    } catch (error) {
      console.error("خطأ في تحديث البيانات:", error);
      res.status(500).json({
        success: false,
        message: "حدث خطأ أثناء تحديث البيانات",
      });
    }
  },
};

export default authController;

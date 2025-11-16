import Joi from "joi";

const authValidation = {
  // تحقق من بيانات التسجيل
  register: Joi.object({
    name: Joi.string().min(2).max(100).required().messages({
      "string.empty": "الاسم مطلوب",
      "string.min": "الاسم يجب أن يكون至少 حرفين",
      "string.max": "الاسم يجب أن لا يتجاوز 100 حرف",
    }),

    email: Joi.string().email().required().messages({
      "string.empty": "البريد الإلكتروني مطلوب",
      "string.email": "صيغة البريد الإلكتروني غير صحيحة",
    }),

    password: Joi.string().min(6).required().messages({
      "string.empty": "كلمة المرور مطلوبة",
      "string.min": "كلمة المرور يجب أن تكون至少 6 أحرف",
    }),

    role: Joi.string().valid("user", "admin").default("user"),
  }),

  // تحقق من بيانات تسجيل الدخول
  login: Joi.object({
    email: Joi.string().email().required().messages({
      "string.empty": "البريد الإلكتروني مطلوب",
      "string.email": "صيغة البريد الإلكتروني غير صحيحة",
    }),

    password: Joi.string().required().messages({
      "string.empty": "كلمة المرور مطلوبة",
    }),
  }),
};

export default authValidation;

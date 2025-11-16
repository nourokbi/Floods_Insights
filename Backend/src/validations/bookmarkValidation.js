import Joi from "joi";

const bookmarkValidation = {
  // تحقق من بيانات تبديل الإشارة المرجعية
  toggle: Joi.object({
    report_id: Joi.number().integer().positive().required().messages({
      "number.base": "معرف التقرير يجب أن يكون رقم",
      "number.positive": "معرف التقرير يجب أن يكون رقم موجب",
      "any.required": "معرف التقرير مطلوب",
    }),
  }),
};

export default bookmarkValidation;

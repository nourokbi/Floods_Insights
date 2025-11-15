import Joi from "joi";

const commentValidation = {
  // تحقق من بيانات إضافة التعليق
  create: Joi.object({
    report_id: Joi.number().integer().positive().required().messages({
      "number.base": "معرف التقرير يجب أن يكون رقم",
      "number.positive": "معرف التقرير يجب أن يكون رقم موجب",
      "any.required": "معرف التقرير مطلوب",
    }),

    comment_text: Joi.string().min(1).max(1000).required().messages({
      "string.empty": "نص التعليق مطلوب",
      "string.min": "نص التعليق يجب أن يكون至少 حرف واحد",
      "string.max": "نص التعليق يجب أن لا يتجاوز 1000 حرف",
    }),
  }),

  // تحقق من بيانات تحديث التعليق
  update: Joi.object({
    comment_text: Joi.string().min(1).max(1000).required().messages({
      "string.empty": "نص التعليق مطلوب",
      "string.min": "نص التعليق يجب أن يكون至少 حرف واحد",
      "string.max": "نص التعليق يجب أن لا يتجاوز 1000 حرف",
    }),
  }),
};

export default commentValidation;

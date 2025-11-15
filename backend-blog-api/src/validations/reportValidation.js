import Joi from "joi";

const reportValidation = {
  // تحقق من بيانات إنشاء التقرير
  create: Joi.object({
    title: Joi.string().min(5).max(255).required().messages({
      "string.empty": "عنوان التقرير مطلوب",
      "string.min": "عنوان التقرير يجب أن يكون至少 5 أحرف",
      "string.max": "عنوان التقرير يجب أن لا يتجاوز 255 حرف",
    }),

    description: Joi.string().min(10).required().messages({
      "string.empty": "وصف التقرير مطلوب",
      "string.min": "وصف التقرير يجب أن يكون至少 10 أحرف",
    }),

    location_name: Joi.string().max(100).required().messages({
      "string.empty": "اسم الموقع مطلوب",
      "string.max": "اسم الموقع يجب أن لا يتجاوز 100 حرف",
    }),

    disaster_type: Joi.string()
      .valid("flood", "earthquake", "wildfire", "storm", "landslide", "other")
      .required()
      .messages({
        "any.only": "نوع الكارثة يجب أن يكون من الأنواع المسموحة",
        "string.empty": "نوع الكارثة مطلوب",
      }),

    longitude: Joi.number().min(-180).max(180).required().messages({
      "number.base": "خط الطول يجب أن يكون رقم",
      "number.min": "خط الطول يجب أن يكون بين -180 و 180",
      "number.max": "خط الطول يجب أن يكون بين -180 و 180",
      "any.required": "خط الطول مطلوب",
    }),

    latitude: Joi.number().min(-90).max(90).required().messages({
      "number.base": "خط العرض يجب أن يكون رقم",
      "number.min": "خط العرض يجب أن يكون بين -90 و 90",
      "number.max": "خط العرض يجب أن يكون بين -90 و 90",
      "any.required": "خط العرض مطلوب",
    }),

    link: Joi.string().uri().allow("").optional().messages({
      "string.uri": "الرابط يجب أن يكون رابط صالح",
    }),

    images: Joi.array().items(Joi.string().uri()).optional().messages({
      "array.base": "الصور يجب أن تكون مصفوفة من روابط",
      "string.uri": "رابط الصورة يجب أن يكون رابط صالح",
    }),

    status: Joi.string().valid("active", "resolved").default("active"),
  }),

  // تحقق من بيانات تحديث التقرير
  update: Joi.object({
    title: Joi.string().min(5).max(255).optional(),

    description: Joi.string().min(10).optional(),

    location_name: Joi.string().max(100).optional(),

    disaster_type: Joi.string()
      .valid("flood", "earthquake", "wildfire", "storm", "landslide", "other")
      .optional(),

    longitude: Joi.number().min(-180).max(180).optional(),

    latitude: Joi.number().min(-90).max(90).optional(),

    link: Joi.string().uri().allow("").optional(),

    images: Joi.array().items(Joi.string().uri()).optional(),

    status: Joi.string().valid("active", "resolved").optional(),
  }),

  // تحقق من بيانات البحث الجغرافي
  nearby: Joi.object({
    lat: Joi.number().min(-90).max(90).required(),

    lng: Joi.number().min(-180).max(180).required(),

    radius: Joi.number().min(1).max(1000).default(10),
  }),
};

export default reportValidation;

import Joi from "joi";

const reportValidation = {
  // تحقق من بيانات إنشاء التقرير
  create: Joi.object({
    title: Joi.string().min(5).max(255).required().messages({
      "string.empty": "Title is required",
      "string.min": "Title must be at least 5 characters",
      "string.max": "Title must not exceed 255 characters",
    }),

    description: Joi.string().min(10).required().messages({
      "string.empty": "Description is required",
      "string.min": "Description must be at least 10 characters",
    }),

    location_name: Joi.string().max(100).required().messages({
      "string.empty": "Location name is required",
      "string.max": "Location name must not exceed 100 characters",
    }),

    disaster_type: Joi.string()
      .valid("flood", "earthquake", "wildfire", "storm", "landslide", "other")
      .required()
      .messages({
        "any.only": "Disaster type must be one of the allowed values",
        "string.empty": "Disaster type is required",
      }),

    // latitude and longitude are optional for reports; if provided they must be valid numbers
    longitude: Joi.number().min(-180).max(180).optional().messages({
      "number.base": "Longitude must be a number",
      "number.min": "Longitude must be between -180 and 180",
      "number.max": "Longitude must be between -180 and 180",
    }),

    latitude: Joi.number().min(-90).max(90).optional().messages({
      "number.base": "Latitude must be a number",
      "number.min": "Latitude must be between -90 and 90",
      "number.max": "Latitude must be between -90 and 90",
    }),

    link: Joi.string().uri().allow("").optional().messages({
      "string.uri": "Link must be a valid URL",
    }),

    images: Joi.array().items(Joi.string().uri()).optional().messages({
      "array.base": "Images must be an array of URLs",
      "string.uri": "Each image must be a valid URL",
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

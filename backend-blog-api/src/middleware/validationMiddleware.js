const validationMiddleware = {
  // middleware للتحقق من صحة البيانات باستخدام Joi
  validate: (schema) => {
    return (req, res, next) => {
      const { error } = schema.validate(req.body);

      if (error) {
        const errorMessage = error.details[0].message;
        return res.status(400).json({
          success: false,
          message: errorMessage,
        });
      }

      next();
    };
  },
};

export default validationMiddleware;

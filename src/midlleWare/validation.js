const dataMethod = ['body', 'query', 'params', 'headers'];

export const validation = (schema) => {
  return (req, res, next) => {
    try {
      const validationErrors = [];

      dataMethod.forEach((key) => {
        if (schema[key]) {
          const { error } = schema[key].validate(req[key], { abortEarly: false });
          if (error) {
            validationErrors.push(...error.details);
          }
        }
      });

      if (validationErrors.length) {
        return res.status(400).json({
          message: 'Validation error',
          errors: validationErrors,
        });
      }
      next();
    } catch (error) {
      return res.status(500).json({ message: `Catch error: ${error.message}` });
    }
  };
};

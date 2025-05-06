import AppError from '../utils/appError.js';

function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errorMessages = result.error.errors
        .map((e) => `${e.path.join('.')}: ${e.message}`)
        .join(' | ');

      return next(new AppError(`Validation Error: ${errorMessages}`, 400));
    }

    req.body = result.data;
    next();
  };
}

export default validate;

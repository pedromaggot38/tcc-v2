import AppError from '../utils/appError.js';
import { filterValidFields } from '../utils/filterValidFields.js';

function validate(schema) {
  return (req, res, next) => {
    const filteredData = filterValidFields(req.body);

    const result = schema.safeParse(filteredData);

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

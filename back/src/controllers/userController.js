import catchAsync from '../utils/catchAsync.js';
//import AppError from '../utils/appError.js';
import db from '../config/db.js';

export const getAllUsers = catchAsync(async (req, res, next) => {
  const users = await db.user.findMany({
    include: {
      articles: true,
    },
  });

  // eslint-disable-next-line no-unused-vars
  const safeUsers = users.map(({ password, ...rest }) => rest);

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      safeUsers,
    },
  });
});

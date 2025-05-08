import db from '../config/db.js';
import catchAsync from '../utils/catchAsync.js';
import { resfc } from '../utils/response.js';

export const getAllDoctors = catchAsync(async (req, res, next) => {
  const users = await db.doctor.findMany({
    orderBy: { createdAt: 'desc' },
  });

  resfc(res, 200, { users });
});

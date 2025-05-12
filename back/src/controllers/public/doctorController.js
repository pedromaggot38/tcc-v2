import db from '../../config/db.js';
import catchAsync from '../../utils/catchAsync.js';
import { resfc } from '../../utils/response.js';

export const getAllDoctors = catchAsync(async (req, res, next) => {
  const doctors = await db.doctor.findMany({
    where: { visible: true },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      specialty: true,
      state: true,
      crm: true,
      schedules: {
        select: {
          dayOfWeek: true,
          startTime: true,
          endTime: true,
        },
      },
    },
  });

  resfc(res, 200, { doctors }, null, doctors.length);
});

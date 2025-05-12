import db from '../../config/db.js';
import catchAsync from '../../utils/catchAsync.js';
import { parseQueryParams } from '../../utils/queryParser.js';
import { resfc } from '../../utils/response.js';

export const getAllDoctors = catchAsync(async (req, res, next) => {
  const { skip, limit, orderBy, filters } = parseQueryParams(req.query);

  const doctors = await db.doctor.findMany({
    where: { visible: true, ...filters },
    skip,
    take: limit,
    orderBy: Object.keys(orderBy).length ? orderBy : { createdAt: 'desc' },
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

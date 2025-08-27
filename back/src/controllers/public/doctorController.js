import db from '../../config/db.js';
import catchAsync from '../../utils/catchAsync.js';
import { parseQueryParams } from '../../utils/queryParser.js';
import { resfc } from '../../utils/response.js';

export const getAllDoctors = catchAsync(async (req, res, next) => {
  const validFilterFields = ['name', 'specialty', 'crm', 'state'];
  const validSortFields = ['name', 'specialty'];

  const { skip, limit, orderBy, filters, page } = parseQueryParams(
    req.query,
    validFilterFields,
    validSortFields,
  );

  const whereClause = { visible: true, ...filters };

  const [totalItems, doctors] = await db.$transaction([
    db.doctor.count({ where: whereClause }),
    db.doctor.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: Object.keys(orderBy).length ? orderBy : { name: 'asc' },
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
    }),
  ]);

  const totalPages = Math.ceil(totalItems / limit);

  resfc(res, 200, {
    doctors,
    pagination: {
      totalItems,
      totalPages,
      currentPage: page,
      pageSize: limit,
    },
  });
});

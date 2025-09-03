import { getAllDoctorsPublicService } from '../../services/doctorService.js';
import catchAsync from '../../utils/catchAsync.js';
import { parseQueryParams } from '../../utils/queryParser.js';
import { resfc } from '../../utils/response.js';

export const getAllDoctorsPublic = catchAsync(async (req, res, next) => {
  const validFilterFields = ['name', 'specialty', 'crm', 'state'];
  const validSortFields = ['name', 'specialty'];

  const { skip, limit, orderBy, filters, page } = parseQueryParams(
    req.query,
    validFilterFields,
    validSortFields,
  );

  const { totalItems, doctors, totalPages } = await getAllDoctorsPublicService({
    filters,
    orderBy,
    skip,
    limit,
  });

  // 4. Envia a resposta formatada
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

import db from '../../config/db.js';
import catchAsync from '../../utils/catchAsync.js';
import { parseQueryParams } from '../../utils/queryParser.js';
import { resfc } from '../../utils/response.js';

export const getAllArticles = catchAsync(async (req, res, next) => {
  const { skip, limit, orderBy, filters } = parseQueryParams(req.query);

  console.log(req.query);

  const articles = await db.article.findMany({
    where: { status: 'published', ...filters },
    skip,
    take: limit,
    orderBy: Object.keys(orderBy).length ? orderBy : { createdAt: 'desc' },
    select: {
      title: true,
      subtitle: true,
      content: true,
      slug: true,
      author: true,
      imageUrl: true,
      imageDescription: true,
      createdAt: true,
    },
  });

  resfc(res, 200, { articles }, null, articles.length);
});

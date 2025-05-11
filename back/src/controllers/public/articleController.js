import db from '../../config/db.js';
import catchAsync from '../../utils/catchAsync.js';
import { resfc } from '../../utils/response.js';

export const getAllArticles = catchAsync(async (req, res, next) => {
  const articles = await db.article.findMany({
    where: { status: 'published' },
    orderBy: { createdAt: 'desc' },
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

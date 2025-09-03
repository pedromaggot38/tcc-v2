import catchAsync from '../../utils/catchAsync.js';
import { parseQueryParams } from '../../utils/queryParser.js';
import { resfc } from '../../utils/response.js';
import {
  getAllArticlesPublicService,
  getArticlePublicService,
} from '../../services/articleService.js';
import AppError from '../../utils/appError.js';

export const getAllArticlesPublic = catchAsync(async (req, res, next) => {
  const validFilterFields = ['title', 'author'];
  const validSortFields = ['createdAt', 'title'];

  const { skip, limit, orderBy, filters, page } = parseQueryParams(
    req.query,
    validFilterFields,
    validSortFields,
  );

  const { totalItems, articles, totalPages } =
    await getAllArticlesPublicService({
      filters,
      orderBy,
      skip,
      limit,
    });

  resfc(res, 200, {
    articles,
    pagination: {
      totalItems,
      totalPages,
      currentPage: page,
      pageSize: limit,
    },
  });
});

export const getArticlePublic = catchAsync(async (req, res, next) => {
  const { slug } = req.params;

  if (!slug) {
    return next(new AppError('O parâmetro slug é obrigatório', 400));
  }

  const article = await getArticlePublicService(slug);

  resfc(res, 200, { article });
});

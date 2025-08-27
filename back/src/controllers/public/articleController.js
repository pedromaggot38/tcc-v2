import db from '../../config/db.js';
import catchAsync from '../../utils/catchAsync.js';
import { parseQueryParams } from '../../utils/queryParser.js';
import { resfc } from '../../utils/response.js';
import AppError from '../../utils/appError.js';

export const getAllArticles = catchAsync(async (req, res, next) => {
  const validFilterFields = ['title', 'author'];
  const validSortFields = ['createdAt', 'title'];

  const { skip, limit, orderBy, filters, page } = parseQueryParams(
    req.query,
    validFilterFields,
    validSortFields,
  );

  const whereClause = { status: 'published', ...filters };

  const [totalItems, articles] = await db.$transaction([
    db.article.count({ where: whereClause }),
    db.article.findMany({
      where: whereClause,
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
    }),
  ]);

  const totalPages = Math.ceil(totalItems / limit);

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

export const getArticle = catchAsync(async (req, res, next) => {
  const { slug } = req.params;

  if (!slug) {
    return next(new AppError('O parâmetro slug é obrigatório', 400));
  }

  const article = await db.article.findUnique({
    where: { slug, status: 'published' },
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

  if (!article) {
    return next(
      new AppError('Artigo não encontrado ou não está publicado', 404),
    );
  }

  resfc(res, 200, { article });
});

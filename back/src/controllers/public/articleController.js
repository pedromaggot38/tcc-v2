import db from '../../config/db.js';
import catchAsync from '../../utils/catchAsync.js';
import { parseQueryParams } from '../../utils/queryParser.js';
import { resfc } from '../../utils/response.js';

export const getAllArticles = catchAsync(async (req, res, next) => {
  const validFilterFields = ['title', 'author'];
  const validSortFields = ['createdAt', 'title'];

  const { skip, limit, orderBy, filters, page } = parseQueryParams(
    req.query,
    validFilterFields,
    validSortFields,
  );

  const totalItems = await db.article.count({
    where: { status: 'published', ...filters },
  });

  const totalPages = Math.ceil(totalItems / limit);

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

  resfc(res, 200, {
    articles,
    totalItems,
    totalPages,
    currentPage: page,
  });
});

export const getArticle = catchAsync(async (req, res, next) => {
  const { slug } = req.params;

  if (!slug) {
    return res.status(400).json({ message: 'O parâmetro slug é obrigatório' });
  }

  const article = await db.article.findUnique({
    where: { slug },
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
    return res.status(404).json({ message: 'Artigo não encontrado' });
  }

  resfc(res, 200, { article });
});

import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import db from '../config/db.js';
import { resfc } from '../utils/response.js';
import convertId from '../utils/convertId.js';

export const getAllArticles = catchAsync(async (req, res, next) => {
  const articles = await db.article.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      createdByUser: {
        select: {
          id: true,
          username: true,
          name: true,
        },
      },
    },
  });

  resfc(res, 200, { articles }, null, articles.length);
});

export const getArticle = catchAsync(async (req, res, next) => {
  const id = convertId(req.params.id);

  const article = await db.article.findUnique({
    where: { id },
    include: {
      createdByUser: {
        select: {
          id: true,
          username: true,
          name: true,
        },
      },
    },
  });

  if (!article) {
    return next(new AppError('Notícia não encontrada', 404));
  }

  resfc(res, 200, { article });
});

export const createArticle = catchAsync(async (req, res, next) => {
  const data = { ...req.body, createdBy: req.user.id };

  const newArticle = await db.article.create({ data });

  resfc(res, 201, { article: newArticle });
});

export const updateArticle = catchAsync(async (req, res, next) => {
  const id = convertId(req.params.id);

  const article = await db.article.findUnique({
    where: { id },
  });

  if (!article) {
    return next(new AppError('Notícia não encontrada', 404));
  }

  const data = { ...req.body, updatedBy: req.user.id };

  const updatedArticle = await db.article.update({
    where: { id },
    data,
  });

  resfc(res, 200, { article: updatedArticle });
});

export const togglePublishArticle = catchAsync(async (req, res, next) => {
  const id = convertId(req.params.id);

  const article = await db.article.findUnique({ where: { id } });

  if (!article) {
    return next(new AppError('Notícia não encontrada', 404));
  }

  let newStatus = 'published' | 'draft';

  switch (article.status) {
    case 'published':
      newStatus = 'draft';
      break;
    case 'draft':
      newStatus = 'published';
      break;
    default:
      return next(new AppError('Status da notícia não permite alteração', 400));
  }

  const updatedArticle = await db.article.update({
    where: { id },
    data: { status: newStatus },
  });

  resfc(
    res,
    200,
    { article: updatedArticle },
    newStatus === 'published'
      ? 'Notícia publicada'
      : 'Notícia movida para rascunho',
  );
});

export const toggleArchiveArticle = catchAsync(async (req, res, next) => {
  const id = convertId(req.params.id);

  const article = await db.article.findUnique({ where: { id } });

  if (!article) {
    return next(new AppError('Notícia não encontrada', 404));
  }

  let newStatus = 'draft' | 'archived';

  switch (article.status) {
    case 'draft':
    case 'published':
      newStatus = 'archived';
      break;
    case 'archived':
      newStatus = 'draft';
      break;
    default:
      return next(
        new AppError('Não é possível alterar o status atual da notícia', 400),
      );
  }

  const updatedArticle = await db.article.update({
    where: { id },
    data: { status: newStatus },
  });

  resfc(
    res,
    200,
    { article: updatedArticle },
    newStatus === 'archived' ? 'Notícia arquivada' : 'Notícia restaurada',
  );
});

export const deleteArticle = catchAsync(async (req, res, next) => {
  const id = convertId(req.params.id);

  const article = await db.article.findUnique({ where: { id } });

  if (!article) {
    return next(new AppError('Notícia não encontrada', 404));
  }

  await db.article.delete({ where: { id } });

  resfc(res, 204);
});

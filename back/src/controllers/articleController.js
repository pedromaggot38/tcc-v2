import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import db from '../config/db.js';
import { resfc } from '../utils/response.js';
import { filterValidFields } from '../utils/filterValidFields.js';
import convertId from '../utils/convertId.js';

export const getAllArticles = catchAsync(async (req, res, next) => {
  const articles = await db.article.findMany({
    include: {
      user: {
        select: {
          id: true,
          username: true,
          name: true,
          role: true,
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
      user: {
        select: {
          id: true,
          username: true,
          name: true,
          role: true,
        },
      },
    },
  });

  if (!article) {
    return next(
      new AppError('Nenhum artigo encontrado com esse id ou id', 404),
    );
  }

  resfc(res, 200, { article });
});

export const createArticle = catchAsync(async (req, res, next) => {
  const {
    title,
    subtitle,
    content,
    author,
    imageUrl,
    imageDescription,
    status,
  } = req.body;

  const userId = req.user.id;

  const newArticle = await db.article.create({
    data: {
      title,
      subtitle,
      content,
      author,
      imageUrl,
      imageDescription,
      userId,
      status,
    },
  });

  resfc(res, 201, { article: newArticle });
});

export const updateArticle = catchAsync(async (req, res, next) => {
  const id = convertId(req.params.id);

  const article = await db.article.findUnique({
    where: { id },
  });

  if (!article) {
    return next(new AppError('Artigo não encontrado', 404));
  }

  const userId = req.user.id;

  const data = filterValidFields({
    ...req.body,
    lastModifiedBy: userId,
  });

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
    return next(new AppError('Nenhum artigo encontrado com esse id', 404));
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
      return next(new AppError('Status do artigo não permite alteração', 400));
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
      ? 'Artigo publicado'
      : 'Artigo movido para rascunho',
  );
});

export const toggleArchiveArticle = catchAsync(async (req, res, next) => {
  const id = convertId(req.params.id);

  const article = await db.article.findUnique({ where: { id } });

  if (!article) {
    return next(new AppError('Nenhum artigo encontrado com esse id', 404));
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
        new AppError('Não é possível alterar o status atual do artigo', 400),
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
    newStatus === 'archived'
      ? 'Artigo arquivado'
      : 'Artigo restaurado para rascunho',
  );
});

export const deleteArticle = catchAsync(async (req, res, next) => {
  const id = convertId(req.params.id);

  const article = await db.article.findUnique({ where: { id } });

  if (!article) {
    return next(new AppError('Nenhum artigo encontrado com esse id', 404));
  }

  await db.article.delete({ where: { id } });

  resfc(res, 204);
});

import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import db from '../config/db.js';
import slugify from 'slugify';
import { resfc } from '../utils/response.js';

export const getAllArticles = catchAsync(async (req, res, next) => {
  const articles = await db.article.findMany({
    include: {
      user: true,
    },
  });

  resfc(res, 200, { articles }, null, articles.length);
});

export const getArticle = catchAsync(async (req, res, next) => {
  const article = await db.article.findUnique(req.params.slug);

  if (!article) {
    return next(new AppError('Nenhum artigo encontrado com esse slug', 404));
  }

  resfc(res, 200, { article });
});

export const createArticle = catchAsync(async (req, res, next) => {
  const { title, subtitle, content, author, imageUrl, imageDescription } =
    req.body;
  const userId = req.user.id;

  const slug = slugify(title, {
    lower: true,
    strict: true,
    replacement: '-',
    locale: 'pt',
  });

  const newArticle = await db.article.create({
    data: {
      title,
      subtitle,
      content,
      author,
      slug,
      imageUrl,
      imageDescription,
      userId,
    },
  });

  resfc(res, 201, { article: newArticle });
});

export const updateArticle = catchAsync(async (req, res, next) => {
  const { title, subtitle, content, author, imageUrl, imageDescription } =
    req.body;
  const slug = req.params.slug;
  const userId = req.user.id;

  const updatedArticle = await db.article.update({
    where: { slug },
    data: {
      title,
      subtitle,
      content,
      author,
      imageUrl,
      imageDescription,
      lastModifiedBy: userId,
    },
  });

  resfc(res, 200, { article: updatedArticle });
});

export const togglePublishedArticle = catchAsync(async (req, res, next) => {
  const slug = req.params.slug;

  const article = await db.article.findUnique({ where: { slug } });

  if (!article) {
    return next(new AppError('Nenhum artigo encontrado com esse slug', 404));
  }

  let newStatus;

  if (article.status === 'published') {
    newStatus = 'draft';
  } else if (article.status === 'draft') {
    newStatus = 'published';
  } else {
    return next(
      new AppError('Não é possível alterar o status atual do artigo', 400),
    );
  }

  const updatedArticle = await db.article.update({
    where: { slug },
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

export const toggleArchivedArticle = catchAsync(async (req, res, next) => {
  const slug = req.params.slug;

  const article = await db.article.findUnique({ where: { slug } });

  if (!article) {
    return next(new AppError('Nenhum artigo encontrado com esse slug', 404));
  }

  let newStatus;

  if (article.status === 'draft' || article.status === 'published') {
    newStatus = 'archived';
  } else if (article.status === 'archived') {
    newStatus = 'draft';
  } else {
    return next(
      new AppError('Não é possível alterar o status atual do artigo', 400),
    );
  }

  const updatedArticle = await db.article.update({
    where: { slug },
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

// Verificar erros depois
export const deleteArticle = catchAsync(async (req, res, next) => {
  const slug = req.params.slug;

  const article = await db.article.findUnique({ where: { slug } });

  if (!article) {
    return next(new AppError('Nenhum artigo encontrado com esse slug', 404));
  }

  await db.article.delete({ where: { slug } });

  resfc(res, 204);
});

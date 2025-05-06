import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import db from '../config/db.js';
import slugify from 'slugify';

const response = (res, code, data, message) => {
  res.status(code).json({
    status: 'success',
    ...(message && { message }),
    data: {
      data,
    },
  });
};

export const getAllArticles = catchAsync(async (req, res, next) => {
  const articles = await db.article.findMany({
    include: {
      user: true,
    },
  });

  res.status(200).json({
    status: 'success',
    results: articles.length,
    data: {
      articles,
    },
  });
});
export const getArticle = catchAsync(async (req, res, next) => {
  const article = await db.article.findUnique(req.params.slug);

  if (!article) {
    return next(new AppError('No article found with that slug', 404));
  }

  response(res, 200, article);
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

  response(res, 201, newArticle);
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
      slug: slugify(title, {
        lower: true,
        strict: true,
        replacement: '-',
        locale: 'pt',
      }),
      imageUrl,
      imageDescription,
      lastModifiedBy: userId,
    },
  });
  response(res, 200, updatedArticle);
});

export const togglePublishedArticle = catchAsync(async (req, res, next) => {
  const slug = req.params.slug;

  const article = await db.article.findUnique({ where: { slug } });

  if (!article) {
    return next(new AppError('No article found with that slug', 404));
  }

  let newStatus;

  if (article.status === 'published') {
    newStatus = 'draft';
  } else if (article.status === 'draft') {
    newStatus = 'published';
  } else {
    return next(new AppError('Cannot toggle article with current status', 400));
  }

  const updatedArticle = await db.article.update({
    where: { slug },
    data: { status: newStatus },
  });

  response(
    res,
    200,
    updatedArticle,
    newStatus === 'published'
      ? 'Artigo publicado'
      : 'Artigo movido para rascunho',
  );
});

export const toggleArchivedArticle = catchAsync(async (req, res, next) => {
  const slug = req.params.slug;

  const article = await db.article.findUnique({ where: { slug } });

  if (!article) {
    return next(new AppError('No article found with that slug', 404));
  }

  let newStatus;

  if (article.status === 'draft' || article.status === 'published') {
    newStatus = 'archived';
  } else if (article.status === 'archived') {
    newStatus = 'draft';
  } else {
    return next(new AppError('Cannot toggle article with current status', 400));
  }

  const updatedArticle = await db.article.update({
    where: { slug },
    data: { status: newStatus },
  });

  response(
    res,
    200,
    updatedArticle,
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
    return next(new AppError('No article found with that slug', 404));
  }

  await db.article.delete({ where: { slug } });

  response(res, 204, null);
});

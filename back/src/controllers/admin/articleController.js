import catchAsync from '../../utils/catchAsync.js';
import AppError from '../../utils/appError.js';
import { resfc } from '../../utils/response.js';
import convertId from '../../utils/convertId.js';
import { parseQueryParams } from '../../utils/queryParser.js';
import {
  createArticleService,
  deleteArticleService,
  getAllArticlesService,
  getArticleService,
  toggleArchiveArticleService,
  togglePublishArticleService,
  updateArticleService,
} from '../../services/articleService.js';

export const getAllArticles = catchAsync(async (req, res, next) => {
  const validFilterFields = ['title', 'author', 'status'];
  const validSortFields = ['createdAt', 'title', 'status'];

  const { skip, limit, orderBy, filters, page } = parseQueryParams(
    req.query,
    validFilterFields,
    validSortFields,
  );

  const { articles, totalArticles, totalPages } = await getAllArticlesService({
    filters,
    orderBy,
    skip,
    limit,
  });

  resfc(res, 200, {
    articles,
    pagination: {
      totalItems: totalArticles,
      totalPages,
      currentPage: page,
      pageSize: limit,
    },
  });
});

export const getArticle = catchAsync(async (req, res, next) => {
  const id = convertId(req.params.id);

  if (!id) {
    return next(
      new AppError('O parâmetro id é obrigatório e deve ser um número', 400),
    );
  }

  const article = await getArticleService(id);

  resfc(res, 200, { article });
});

export const createArticle = catchAsync(async (req, res, next) => {
  const articleData = req.body;
  const userId = req.user.id;

  const newArticle = await createArticleService(articleData, userId);

  resfc(res, 201, { article: newArticle });
});

export const updateArticle = catchAsync(async (req, res, next) => {
  const articleId = convertId(req.params.id);

  if (!articleId) {
    return next(
      new AppError('O parâmetro id é obrigatório e deve ser um número', 400),
    );
  }

  const updateData = req.body;
  const userId = req.user.id;

  const updatedArticle = await updateArticleService(
    articleId,
    updateData,
    userId,
  );

  resfc(res, 200, { article: updatedArticle });
});

export const togglePublishArticle = catchAsync(async (req, res, next) => {
  const articleId = convertId(req.params.id);

  if (!articleId) {
    return next(
      new AppError('O parâmetro id é obrigatório e deve ser um número', 400),
    );
  }

  const { updatedArticle, newStatus } =
    await togglePublishArticleService(articleId);

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
  const articleId = convertId(req.params.id);

  if (!articleId) {
    return next(
      new AppError('O parâmetro id é obrigatório e deve ser um número', 400),
    );
  }

  const { updatedArticle, newStatus } =
    await toggleArchiveArticleService(articleId);

  resfc(
    res,
    200,
    { article: updatedArticle },
    newStatus === 'archived' ? 'Notícia arquivada' : 'Notícia restaurada',
  );
});

export const deleteArticle = catchAsync(async (req, res, next) => {
  const articleId = convertId(req.params.id);

  if (!articleId) {
    return next(
      new AppError('O parâmetro id é obrigatório e deve ser um número', 400),
    );
  }
  await deleteArticleService(articleId);

  resfc(res, 204);
});

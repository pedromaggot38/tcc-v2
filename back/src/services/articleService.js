import db from '../config/db.js';
import AppError from '../utils/appError.js';
import { sanitizeArticleContent } from '../utils/controllers/articleUtils.js';

/**
 * Busca uma lista paginada de artigos com base em filtros e ordenação.
 * @param {object} queryOptions - Opções de consulta.
 * @param {object} queryOptions.filters - Filtros para a cláusula 'where' do Prisma.
 * @param {object} queryOptions.orderBy - Objeto de ordenação do Prisma.
 * @param {number} queryOptions.skip - Número de registros a pular (offset).
 * @param {number} queryOptions.limit - Número de registros a retornar (limit).
 * @returns {Promise<object>} Um objeto contendo os artigos e os totais de paginação.
 */
export const getAllArticlesService = async ({
  filters,
  orderBy,
  skip,
  limit,
}) => {
  const [totalArticles, articles] = await Promise.all([
    db.article.count({ where: filters }),
    db.article.findMany({
      where: filters,
      skip,
      take: limit,
      orderBy: Object.keys(orderBy).length ? orderBy : { createdAt: 'desc' },
      include: {
        createdByUser: {
          select: {
            id: true,
            username: true,
            name: true,
          },
        },
      },
    }),
  ]);

  const totalPages = Math.ceil(totalArticles / limit);

  return { articles, totalArticles, totalPages };
};

export const getArticleService = async ({ articleId }) => {
  const article = await db.article.findUnique({
    where: { id: articleId },
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
    throw new AppError('Notícia não encontrada', 404);
  }

  return article;
};

/**
 * Cria um novo artigo no banco de dados.
 * @param {object} articleData - Os dados do artigo vindos do corpo da requisição.
 * @param {string} userId - O ID do usuário que está criando o artigo.
 * @returns {Promise<object>} O objeto do artigo recém-criado.
 */
export const createArticleService = async (articleData, userId) => {
  if (articleData.content) {
    articleData.content = sanitizeArticleContent(articleData.content);
  }

  const dataToCreate = {
    ...articleData,
    createdBy: userId,
  };

  const newArticle = await db.article.create({
    data: dataToCreate,
  });

  return newArticle;
};

/**
 * Atualiza um artigo existente.
 * @param {number} articleId - O ID do artigo a ser atualizado.
 * @param {object} updateData - Os dados para atualização.
 * @param {string} userId - O ID do usuário que está realizando a atualização.
 * @returns {Promise<object>} O objeto do artigo atualizado.
 * @throws {AppError} Se o artigo não for encontrado.
 */
export const updateArticleService = async (articleId, updateData, userId) => {
  if (updateData.content) {
    updateData.content = sanitizeArticleContent(updateData.content);
  }

  const data = { ...updateData, updatedBy: userId };

  const updatedArticle = await db.article.update({
    where: { id: articleId },
    data,
  });

  return updatedArticle;
};

export const togglePublishArticleService = async (articleId) => {
  const article = await db.article.findUnique({ where: { id: articleId } });

  if (!article) {
    throw new AppError('Notícia não encontrada', 404);
  }

  let newStatus;
  switch (article.status) {
    case 'published':
      newStatus = 'draft';
      break;
    case 'draft':
      newStatus = 'published';
      break;
    default:
      throw new AppError(
        'O status atual da notícia não permite esta alteração',
        400,
      );
  }

  const updatedArticle = await db.article.update({
    where: { id: articleId },
    data: { status: newStatus },
  });

  return { updatedArticle, newStatus };
};

export const toggleArchiveArticleService = async (articleId) => {
  const article = await db.article.findUnique({ where: { id: articleId } });

  if (!article) {
    throw new AppError('Notícia não encontrada', 404);
  }

  let newStatus;
  switch (article.status) {
    case 'draft':
    case 'published':
      newStatus = 'archived';
      break;
    case 'archived':
      newStatus = 'draft';
      break;
    default:
      throw new AppError(
        'O status atual da notícia não permite esta alteração',
        400,
      );
  }

  const updatedArticle = await db.article.update({
    where: { id: articleId },
    data: { status: newStatus },
  });

  return { updatedArticle, newStatus };
};

/**
 * Deleta um artigo do banco de dados.
 * @param {number} articleId - O ID do artigo a ser deletado.
 * @throws {Prisma.PrismaClientKnownRequestError} Lança erro P2025 se o artigo não for encontrado.
 */
export const deleteArticleService = async (articleId) => {
  await db.article.delete({ where: { id: articleId } });
};

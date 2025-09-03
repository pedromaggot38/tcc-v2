import express from 'express';
import {
  createArticle,
  deleteArticle,
  getAllArticles,
  getArticle,
  toggleArchiveArticle,
  togglePublishArticle,
  updateArticle,
} from '../../controllers/admin/articleController.js';
import validate from '../../middlewares/validate.js';
import {
  createArticleZodSchema,
  updateArticleZodSchema,
} from '../../models/articleZodSchema.js';
import { adminOrRoot, authenticatedUser } from '../../middlewares/auth.js';

const router = express.Router();

router
  .route('/')
  .get(...authenticatedUser, getAllArticles)
  .post(...authenticatedUser, validate(createArticleZodSchema), createArticle);

router
  .route('/:id')
  .get(...authenticatedUser, getArticle)
  .patch(...authenticatedUser, validate(updateArticleZodSchema), updateArticle)
  .delete(...adminOrRoot, deleteArticle);

router.patch('/:id/publish', ...authenticatedUser, togglePublishArticle);
router.patch(
  '/:id/archive',
  ...adminOrRoot,
  toggleArchiveArticle,
);

export default router;

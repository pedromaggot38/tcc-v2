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
import { protect, restrictTo } from '../../controllers/admin/authController.js';

const router = express.Router();

router
  .route('/')
  .get(protect, getAllArticles)
  .post(protect, validate(createArticleZodSchema), createArticle);

router
  .route('/:id')
  .get(protect, getArticle)
  .patch(protect, validate(updateArticleZodSchema), updateArticle)
  .delete(protect, restrictTo('admin', 'root'), deleteArticle);

router.patch('/:id/publish', protect, togglePublishArticle);
router.patch(
  '/:id/archive',
  protect,
  restrictTo('admin', 'root'),
  toggleArchiveArticle,
);

export default router;

import express from 'express';
import {
  createArticle,
  deleteArticle,
  getAllArticles,
  getArticle,
  toggleArchivedArticle,
  togglePublishedArticle,
  updateArticle,
} from '../controllers/articleController.js';
import validate from '../middlewares/validate.js';
import {
  createArticleZodSchema,
  updateArticleZodSchema,
} from '../models/articleZodSchema.js';
import { protect } from '../controllers/authController.js';

const router = express.Router();

router
  .route('/')
  .get(protect, getAllArticles)
  .post(protect, validate(createArticleZodSchema), createArticle);

router
  .route('/:slug')
  .get(protect, getArticle)
  .patch(protect, validate(updateArticleZodSchema), updateArticle)
  .delete(protect, deleteArticle);

router.patch('/:slug/publish', protect, togglePublishedArticle);
router.patch('/:slug/archive', protect, toggleArchivedArticle);

export default router;

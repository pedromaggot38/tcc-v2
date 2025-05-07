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
import { articleZodSchema } from '../models/articleZodSchema.js';
import { protect } from '../controllers/authController.js';

const router = express.Router();

router
  .route('/')
  .get(protect, getAllArticles)
  .post(protect, validate(articleZodSchema), createArticle);

router
  .route('/:slug')
  .get(getArticle)
  .patch(updateArticle)
  .delete(deleteArticle);

router.patch('/:slug/publish', togglePublishedArticle);
router.patch('/:slug/archive', toggleArchivedArticle);

export default router;

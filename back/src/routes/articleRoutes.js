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

const router = express.Router();

router.route('/').get(getAllArticles).post(createArticle);

router
  .route('/:slug')
  .get(getArticle)
  .patch(updateArticle)
  .delete(deleteArticle);

router.patch('/:slug/publish', togglePublishedArticle);
router.patch('/:slug/archive', toggleArchivedArticle);

export default router;

import express from 'express';
import {
  getAllArticlesPublic,
  getArticlePublic,
} from '../../controllers/public/articleController.js';

const router = express.Router();

router.route('/').get(getAllArticlesPublic);

router.route('/:slug').get(getArticlePublic);

export default router;

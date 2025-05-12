import express from 'express';
import {
  getAllArticles,
  getArticle,
} from '../../controllers/public/articleController.js';

const router = express.Router();

router.route('/').get(getAllArticles);

router.route('/:slug').get(getArticle);

export default router;

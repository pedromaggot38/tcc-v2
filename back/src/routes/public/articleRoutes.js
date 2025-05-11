import express from 'express';
import { getAllArticles } from '../../controllers/public/articleController.js';

const router = express.Router();

router.route('/').get(getAllArticles);

router.route('/:id');

export default router;

import express from 'express';
import { getAllDoctors } from '../../controllers/public/doctorController.js';

const router = express.Router();

router.route('/').get(getAllDoctors);

router.route('/:id');

export default router;

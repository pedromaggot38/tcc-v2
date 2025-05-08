import express from 'express';
import { getAllDoctors } from '../controllers/doctorController.js';

const router = express.Router();

router.route('/').get(getAllDoctors);

export default router;

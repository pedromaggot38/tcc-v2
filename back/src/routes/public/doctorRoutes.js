import express from 'express';
import { getAllDoctorsPublic } from '../../controllers/public/doctorController.js';

const router = express.Router();

router.route('/').get(getAllDoctorsPublic);

export default router;

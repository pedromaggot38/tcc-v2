import express from 'express';
import {
  createDoctor,
  getAllDoctors,
  getDoctor,
  updateDoctor,
} from '../../controllers/admin/doctorController.js';
import { protect, restrictTo } from '../../controllers/admin/authController.js';
import validate from '../../middlewares/validate.js';
import { createDoctorZodSchema } from '../../models/doctorZodSchema.js';

const adminOrRoot = [protect, restrictTo('admin', 'root')];

const router = express.Router();

router
  .route('/')
  .get(adminOrRoot, getAllDoctors)
  .post(adminOrRoot, validate(createDoctorZodSchema), createDoctor);

router
  .route('/:id')
  .get(protect, getDoctor)
  .post(protect, updateDoctor)
  .delete(protect, restrictTo('admin', 'root'), updateDoctor);

router.route('/:id/visibility').patch(protect, restrictTo('admin', 'root'));

export default router;

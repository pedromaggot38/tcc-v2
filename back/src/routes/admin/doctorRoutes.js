import express from 'express';
import {
  createDoctor,
  getAllDoctors,
  getDoctor,
  toggleVisibilityDoctor,
  updateDoctor,
} from '../../controllers/admin/doctorController.js';
import validate from '../../middlewares/validate.js';
import { adminOrRoot } from '../../middlewares/auth.js';
import { createDoctorZodSchema } from '../../models/doctorZodSchema.js';

const router = express.Router();

router
  .route('/')
  .get(...adminOrRoot, getAllDoctors)
  .post(...adminOrRoot, validate(createDoctorZodSchema), createDoctor);

router
  .route('/:id')
  .get(...adminOrRoot, getDoctor)
  .post(...adminOrRoot, updateDoctor)
  .delete(...adminOrRoot, updateDoctor);

router.route('/:id/visibility').patch(...adminOrRoot, toggleVisibilityDoctor);

export default router;

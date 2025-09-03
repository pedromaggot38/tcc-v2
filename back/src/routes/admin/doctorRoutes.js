import express from 'express';
import {
  createDoctor,
  deleteDoctor,
  getAllDoctors,
  getDoctor,
  toggleVisibilityDoctor,
  updateDoctor,
} from '../../controllers/admin/doctorController.js';
import validate from '../../middlewares/validate.js';
import { adminOrRoot } from '../../middlewares/auth.js';
import {
  createDoctorZodSchema,
  updateDoctorZodSchema,
} from '../../models/doctorZodSchema.js';

const router = express.Router();

router
  .route('/')
  .get(...adminOrRoot, getAllDoctors)
  .post(...adminOrRoot, validate(createDoctorZodSchema), createDoctor);

router
  .route('/:id')
  .get(...adminOrRoot, getDoctor)
  .patch(...adminOrRoot, validate(updateDoctorZodSchema), updateDoctor)
  .delete(...adminOrRoot, deleteDoctor);

router.route('/:id/visibility').patch(...adminOrRoot, toggleVisibilityDoctor);

export default router;

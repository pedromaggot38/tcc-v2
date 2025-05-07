import express from 'express';
import {
  login,
  signUp,
  forgotPassword,
  resetPassword,
} from '../controllers/authController.js';
import validate from '../middlewares/validate.js';
import { createUserZodSchema } from '../models/userZodSchema.js';

const router = express.Router();

router.post('/signup', validate(createUserZodSchema), signUp);
router.post('/login', login);

router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

export default router;

import express from 'express';
import {
  login,
  forgotPassword,
  resetPassword,
  logout,
} from '../../controllers/admin/authController.js';
import {
  checkRootExists,
  handleRootCreation,
} from '../../controllers/admin/rootController.js';
import {
  createRootSchema,
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
} from '../../models/userZodSchema.js';
import validate from '../../middlewares/validate.js';

const router = express.Router();

router.get('/check-root', checkRootExists);
router.post('/create-root', validate(createRootSchema), handleRootCreation);

//router.post('/signup', validate(), signUp);
router.post('/login', validate(loginSchema), login);
router.get('/logout', logout);

router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.patch(
  '/reset-password/:token',
  validate(resetPasswordSchema),
  resetPassword,
);

export default router;

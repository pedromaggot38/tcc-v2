import express from 'express';
import {
  login,
  forgotPassword,
  resetPassword,
  logout,
} from '../../controllers/admin/authController.js';
import { checkRootExists } from '../../controllers/admin/rootController.js';
import {
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../../models/userZodSchema.js';
import validate from '../../middlewares/validate.js';

const router = express.Router();

router.route('/check-root-exists').get(checkRootExists);

//router.post('/signup', validate(), signUp);
router.post('/login', login);
router.get('/logout', logout);

router.post('/forgotPassword', validate(forgotPasswordSchema), forgotPassword);
router.patch(
  '/resetPassword/:token',
  validate(resetPasswordSchema),
  resetPassword,
);

export default router;

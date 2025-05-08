import express from 'express';
import {
  login,
  forgotPassword,
  resetPassword,
} from '../controllers/authController.js';
import {
  checkRootExists,
  createRootUser,
} from '../controllers/rootController.js';

const router = express.Router();

router.route('/check-root').get(checkRootExists).post(createRootUser);

//router.post('/signup', validate(createRootZodSchema), signUp);
router.post('/login', login);

router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

export default router;

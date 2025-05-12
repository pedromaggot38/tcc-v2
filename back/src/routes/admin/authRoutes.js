import express from 'express';
import {
  login,
  forgotPassword,
  resetPassword,
  logout,
} from '../../controllers/admin/authController.js';
import { checkRootExists } from '../../controllers/admin/rootController.js';

const router = express.Router();

router.route('/check-root-exists').get(checkRootExists);

//router.post('/signup', validate(createRootZodSchema), signUp);
router.post('/login', login);
router.get('/logout', logout);

router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

export default router;

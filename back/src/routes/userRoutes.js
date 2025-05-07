import express from 'express';

import {
  protect,
  restrictTo,
  updateMyPassword,
} from '../controllers/authController.js';
import {
  createUserAsRoot,
  deleteUserAsRoot,
  getAllUsersAsRoot,
  getUserAsRoot,
  updateUserAsRoot,
  updateUserPasswordAsRoot,
} from '../controllers/rootController.js';
import {
  deactivateMyAccount,
  getMe,
  updateMe,
} from '../controllers/userController.js';
import validate from '../middlewares/validate.js';
import {
  updateMyPasswordZodSchema,
  updateUserZodSchema,
} from '../models/userZodSchema.js';

const router = express.Router();

router
  .route('/me')
  .get(protect, getMe)
  .patch(protect, validate(updateUserZodSchema), updateMe)
  .delete(protect, deactivateMyAccount);

router.patch(
  '/me/password',
  protect,
  validate(updateMyPasswordZodSchema),
  updateMyPassword,
);

// Root/admin only
router.get('/', protect, restrictTo('admin', 'root'), getAllUsersAsRoot);
router.post('/', protect, restrictTo('admin', 'root'), createUserAsRoot);

router
  .route('/:username')
  .get(protect, restrictTo('admin', 'root'), getUserAsRoot)
  .patch(protect, restrictTo('admin', 'root'), updateUserAsRoot)
  .delete(protect, restrictTo('root'), deleteUserAsRoot);

router.patch(
  '/:username/password',
  protect,
  restrictTo('root'),
  updateUserPasswordAsRoot,
);

export default router;

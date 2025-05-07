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
  createUserAsRootZodSchema,
  updateMyPasswordZodSchema,
  updateUserAsRootZodSchema,
  updateUserPasswordAsRootZodSchema,
  updateUserZodSchema,
} from '../models/userZodSchema.js';

const adminOrRoot = [protect, restrictTo('admin', 'root')];
const rootOnly = [protect, restrictTo('root')];

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
router.get('/', adminOrRoot, getAllUsersAsRoot);
router.post(
  '/',
  adminOrRoot,
  validate(createUserAsRootZodSchema),
  createUserAsRoot,
);

router
  .route('/:username')
  .get(adminOrRoot, getUserAsRoot)
  .patch(adminOrRoot, validate(updateUserAsRootZodSchema), updateUserAsRoot)
  .delete(rootOnly, deleteUserAsRoot);

router.patch(
  '/:username/password',
  rootOnly,
  validate(updateUserPasswordAsRootZodSchema),
  updateUserPasswordAsRoot,
);

export default router;

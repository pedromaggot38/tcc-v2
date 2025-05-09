import express from 'express';

import {
  protect,
  restrictTo,
  updateMyPassword,
} from '../controllers/authController.js';
import {
  createUserAsRoot,
  deleteUserAsRoot,
  eligibleForRootTransfer,
  getAllUsersAsRoot,
  getUserAsRoot,
  transferRootRole,
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
  updateMeZodSchema,
} from '../models/userZodSchema.js';

const adminOrRoot = [protect, restrictTo('admin', 'root')];
const rootOnly = [protect, restrictTo('root')];

const router = express.Router();

router.get('/', adminOrRoot, getAllUsersAsRoot);
router.post(
  '/',
  adminOrRoot,
  validate(createUserAsRootZodSchema),
  createUserAsRoot,
);
router.get('/eligible-for-root', rootOnly, eligibleForRootTransfer);
router.post('/transfer-root', rootOnly, transferRootRole);

router
  .route('/me')
  .get(protect, getMe)
  .patch(protect, validate(updateMeZodSchema), updateMe)
  .delete(protect, deactivateMyAccount);

router.patch(
  '/me/password',
  protect,
  validate(updateMyPasswordZodSchema),
  updateMyPassword,
);

router
  .route('/:username')
  .get(adminOrRoot, getUserAsRoot)
  .patch(adminOrRoot, validate(updateUserAsRootZodSchema), updateUserAsRoot);

router.patch(
  '/:username/password',
  rootOnly,
  validate(updateUserPasswordAsRootZodSchema),
  updateUserPasswordAsRoot,
);

router.route('/:username/delete').post(rootOnly, deleteUserAsRoot);

export default router;

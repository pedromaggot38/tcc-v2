import express from 'express';

import {
  createUser,
  deleteUserAsRoot,
  eligibleForRootTransfer,
  getAllUsers,
  getUser,
  transferRootRole,
  updateUser,
  updateUserPasswordAsRoot,
} from '../../controllers/admin/rootController.js';
import {
  deactivateMyAccount,
  getMe,
  updateMe,
  updateMyPassword,
} from '../../controllers/admin/userController.js';
import validate from '../../middlewares/validate.js';
import {
  updateMyPasswordZodSchema,
  updateUserPasswordAsRootZodSchema,
  updateMeZodSchema,
  updateUserZodSchema,
  createUserZodSchema,
} from '../../models/userZodSchema.js';
import {
  adminOrRoot,
  authenticatedUser,
  checkUserHierarchy,
  rootOnly,
} from '../../middlewares/auth.js';

const router = express.Router();

router.get('/', ...adminOrRoot, getAllUsers);
router.post('/', ...adminOrRoot, validate(createUserZodSchema), createUser);

router.get('/eligible-for-root', ...rootOnly, eligibleForRootTransfer);
router.post('/transfer-root', ...rootOnly, transferRootRole);

router
  .route('/me')
  .get(...authenticatedUser, getMe)
  .patch(...authenticatedUser, validate(updateMeZodSchema), updateMe)
  .delete(...authenticatedUser, deactivateMyAccount);

router.patch(
  '/me/password',
  ...authenticatedUser,
  validate(updateMyPasswordZodSchema),
  updateMyPassword,
);

router
  .route('/:username')
  .get(...adminOrRoot, getUser)
  .patch(
    ...adminOrRoot,
    checkUserHierarchy,
    validate(updateUserZodSchema),
    updateUser,
  );

router.patch(
  '/:username/password',
  ...rootOnly,
  validate(updateUserPasswordAsRootZodSchema),
  updateUserPasswordAsRoot,
);

router.route('/:username/delete').post(rootOnly, deleteUserAsRoot);

export default router;

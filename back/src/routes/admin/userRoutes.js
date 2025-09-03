import express from 'express';

import {
  createUser,
  deleteUserAsRoot,
  eligibleForRootTransfer,
  getAllUsers,
  getUser,
  toggleUserActive,
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
  updateMyPasswordSchema,
  updateUserPasswordAsRootSchema,
  updateMeSchema,
  updateUserSchema,
  createUserSchema,
  transferRootRoleConfirmationSchema,
  deleteUserConfirmationSchema,
} from '../../models/userZodSchema.js';
import {
  adminOrRoot,
  authenticatedUser,
  checkUserHierarchy,
  rootOnly,
} from '../../middlewares/auth.js';

const router = express.Router();

router
  .route('/me')
  .get(...authenticatedUser, getMe)
  .patch(...authenticatedUser, validate(updateMeSchema), updateMe)
  .delete(...authenticatedUser, deactivateMyAccount);

router.patch(
  '/me/password',
  ...authenticatedUser,
  validate(updateMyPasswordSchema),
  updateMyPassword,
);

// ADMIN OR ROOT ROUTES ONLY

router.get('/', ...adminOrRoot, getAllUsers);
router.post('/', ...adminOrRoot, validate(createUserSchema), createUser);

router.get('/eligible-for-root', ...rootOnly, eligibleForRootTransfer);
router.post(
  '/transfer-root',
  ...rootOnly,
  validate(transferRootRoleConfirmationSchema),
  transferRootRole,
);

router
  .route('/:username')
  .get(...adminOrRoot, getUser)
  .patch(
    ...adminOrRoot,
    checkUserHierarchy,
    validate(updateUserSchema),
    updateUser,
  )
  .delete(
    ...rootOnly,
    validate(deleteUserConfirmationSchema),
    deleteUserAsRoot,
  );

router.patch(
  '/:username/active',
  ...adminOrRoot,
  checkUserHierarchy,
  toggleUserActive,
);

router.patch(
  '/:username/password',
  ...rootOnly,
  validate(updateUserPasswordAsRootSchema),
  updateUserPasswordAsRoot,
);

export default router;

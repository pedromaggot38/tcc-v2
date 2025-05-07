import express from 'express';

import { protect, restrictTo } from '../controllers/authController.js';
import {
  createUserAsRoot,
  deleteUserAsRoot,
  getAllUsersAsRoot,
  getUserAsRoot,
  updateUserAsRoot,
  updateUserPasswordAsRoot,
} from '../controllers/rootController.js';
import { getMe } from '../controllers/userController.js';

const router = express.Router();

router.route('/me').get(protect, getMe).patch(protect);

// --- Root-only functions ---
router.get('/', protect, restrictTo('admin', 'root'), getAllUsersAsRoot);

router
  .route('/:username')
  .get(protect, restrictTo('admin', 'root'), getUserAsRoot)
  .post(protect, restrictTo('admin', 'root'), createUserAsRoot);

router
  .route('/edit/:username')
  .patch(protect, restrictTo('admin', 'root'), updateUserAsRoot)
  .delete(protect, restrictTo('root'), deleteUserAsRoot);

router
  .route('/edit/:username/password')
  .patch(protect, restrictTo('root'), updateUserPasswordAsRoot);
/*

router.post('/forgotPassword');
router.patch('/resetPassword/:token');

router.patch(
  '/updateMyPassword',
  authController.protect,
  authController.updatePassword,
);
router.patch('/updateMe', authController.protect, userController.updateMe);
router.delete('/deleteMe', authController.protect, userController.deleteMe);
*/

export default router;

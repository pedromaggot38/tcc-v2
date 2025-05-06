import express from 'express';
import { getAllUsers } from '../controllers/userController.js';

const router = express.Router();

router.route('/').get(getAllUsers);

/*
router.post('/signUp', userController.);
router.post('/login');

router.post('/forgotPassword');
router.patch('/resetPassword/:token');

router.patch(
  '/updateMyPassword',
  authController.protect,
  authController.updatePassword,
);
router.patch('/updateMe', authController.protect, userController.updateMe);
router.delete('/deleteMe', authController.protect, userController.deleteMe);


router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);
*/

export default router;

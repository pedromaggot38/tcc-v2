import catchAsync from '../../utils/catchAsync.js';
import { resfc } from '../../utils/response.js';
import {
  deactivateMyAccountService,
  getMeService,
  updateMeService,
  updateMyUserPasswordService,
} from '../../services/userService.js';
import { clearAuthCookie } from '../../utils/controllers/authUtils.js';

export const getMe = catchAsync(async (req, res, next) => {
  const { id } = req.user;

  const user = await getMeService(id);

  resfc(res, 200, { user });
});

export const updateMe = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const updateData = req.body;

  const updatedUser = await updateMeService(userId, updateData);

  resfc(res, 200, { user: updatedUser });
});

export const updateMyPassword = catchAsync(async (req, res, next) => {
  const { currentPassword, password: newPassword } = req.body;
  const userId = req.user.id;

  await updateMyUserPasswordService(userId, currentPassword, newPassword);

  resfc(res, 200, null, 'Senha alterada com sucesso');
});

export const deactivateMyAccount = catchAsync(async (req, res, next) => {
  const { id } = req.user;

  await deactivateMyAccountService(id);

  clearAuthCookie(res);

  resfc(res, 200, null, 'Conta desativada com sucesso. Você foi desconectado!');
});

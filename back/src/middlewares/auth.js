import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import { promisify } from 'util';
import jwt from 'jsonwebtoken';
import db from '../config/db.js';
import { hasPasswordChangedAfter } from '../utils/controllers/userUtils.js';

export const protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token && req.cookies?.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError(
        'Você não está logado. Por favor, faça o login para obter acesso',
        401,
      ),
    );
  }

  let decoded;
  try {
    decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    // eslint-disable-next-line no-unused-vars
  } catch (err) {
    return next(
      new AppError(
        'Token inválido ou expirado. Por favor, faça login novamente.',
        401,
      ),
    );
  }

  const currentUser = await db.user.findUnique({ where: { id: decoded.id } });
  if (!currentUser) {
    return next(
      new AppError('O usuário associado a este token não existe mais', 401),
    );
  }

  if (!currentUser.active) {
    return next(
      new AppError('Este usuário está desativado. Acesso negado.', 403),
    );
  }

  if (hasPasswordChangedAfter(currentUser.passwordChangedAt, decoded.iat)) {
    return next(
      new AppError(
        'Senha foi alterada recentemente. Por favor, faça login novamente.',
        401,
      ),
    );
  }

  req.user = currentUser;
  next();
});

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('Você não tem permissão para realizar esta ação', 403),
      );
    }
    next();
  };
};

export const checkUserHierarchy = catchAsync(async (req, res, next) => {
  const targetUser = await db.user.findUnique({
    where: { username: req.params.username },
  });

  if (!targetUser) {
    return next(
      new AppError('O usuário alvo da operação não foi encontrado', 404),
    );
  }

  const currentUser = req.user;

  const isAdminEditingAdminOrRoot =
    currentUser.role === 'admin' && ['admin', 'root'].includes(targetUser.role);

  if (isAdminEditingAdminOrRoot) {
    return next(
      new AppError(
        'Administradores não podem editar outros administradores ou o root',
        403,
      ),
    );
  }
  // Se passou na verificação, pode prosseguir para o próximo middleware ou controller
  next();
});

export const adminOrRoot = [protect, restrictTo('admin', 'root')];
export const rootOnly = [protect, restrictTo('root')];
export const authenticatedUser = [protect];

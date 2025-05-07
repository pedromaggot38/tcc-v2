import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import db from '../config/db.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';
import { resfc } from '../utils/response.js';
import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import { hasPasswordChangedAfter } from '../utils/controllers/userUtils.js';

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user.id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  // Remove fields from output
  user.password = undefined;
  user.active = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

export const signUp = catchAsync(async (req, res, next) => {
  const { username, password, email, name, phone, image } = req.body;

  const newUser = await db.user.create({
    data: {
      username,
      password,
      email,
      name,
      phone,
      image,
    },
  });

  createSendToken(newUser, 201, res);
});

export const login = catchAsync(async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }

  const user = await db.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      password: true,
    },
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return next(new AppError('Incorrect username or password', 404));
  }

  createSendToken(user, 200, res);
});

export const protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError(
        'Sessão expirada ou não autenticada. Por favor, entre novamente',
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
        new AppError('You do not have permission to perform this action', 403),
      );
    }
    next();
  };
};

export const forgotPassword = catchAsync(async (req, res, next) => {
  const user = await db.user.findUnique({
    where: { username: req.body.username },
  });

  if (!user) {
    next(new AppError('No user found', 404));
  }
});

export const resetPassword = catchAsync(async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;

  const receivedHashToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  const user = await db.user.findFirst({
    where: {
      passwordResetToken: receivedHashToken,
      passwordResetExpires: {
        gt: new Date(),
      },
    },
  });

  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  const updatedUser = await db.user.update({
    where: { id: user.id },
    data: {
      password,
      passwordResetToken: null,
      passwordResetExpires: null,
    },
  });

  resfc(res, 200, { user: updatedUser });
});

export const updatePassword = catchAsync(async (req, res, next) => {});

export const logout = catchAsync(async (req, res, next) => {});

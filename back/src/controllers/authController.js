import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import db from '../config/db.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';
import { hashPassword } from '../utils/controllers/userUtils.js';

const resp = (res, code, user) => {
  res.status(code).json({
    status: 'success',
    data: {
      user,
    },
  });
};

export const signUp = catchAsync(async (req, res, next) => {
  const {
    username,
    password,
    role = 'journalist',
    isBlocked = false,
    name,
    phone,
    email,
    image,
  } = req.body;

  const hashedPassword = await hashPassword(password);
  console.log(password, hashedPassword);

  const newUser = await db.user.create({
    data: {
      username,
      password: hashedPassword,
      role,
      isBlocked,
      name,
      phone,
      email,
      image,
    },
  });

  resp(res, 201, newUser);
});

export const login = catchAsync(async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }

  const user = await db.user.findUnique({ where: { username } });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return next(new AppError('Incorrect username or password', 404));
  }

  resp(res, 200, user);
});

export const protect = catchAsync(async (req, res, next) => {});

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
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await db.user.findFirst({
    passwordResetToken: hashedToken,
    passwordResetExpires: {
      gt: new Date(),
    },
  });

  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  const hashedPassword = hashPassword(req.body.password);
  const updatedUser = await db.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpires: null,
    },
  });

  resp(res, 200, updatedUser);
});

export const updatePassword = catchAsync(async (req, res, next) => {});

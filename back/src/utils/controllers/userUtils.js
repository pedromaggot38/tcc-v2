import bcrypt from 'bcryptjs';
import AppError from '../appError.js';

export const hashPassword = async (password) => {
  if (!password) {
    throw new AppError('Please provide a password', 400);
  }
  return await bcrypt.hash(password, 12);
};

export const comparePassword = async (candidatePassword, storedPassword) => {
  return await bcrypt.compare(candidatePassword, storedPassword);
};

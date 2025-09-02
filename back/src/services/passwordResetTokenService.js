import db from "../config/db.js";
import crypto from 'crypto';

export const createPasswordResetToken = async (userId) => {
  const resetToken = crypto.randomBytes(32).toString('hex');

  const hashedToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  const expires = new Date(Date.now() + 10 * 60 * 1000);

  await db.user.update({
    where: { id: userId },
    data: {
      passwordResetToken: hashedToken,
      passwordResetExpires: expires,
    },
  });

  return { token: resetToken, hashedToken, expires };
};

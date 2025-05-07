import { PrismaClient } from '../generated/prisma/index.js';
import { hashPassword } from '../utils/controllers/userUtils.js';

const globalForPrisma = globalThis;
const db = globalForPrisma.prisma || new PrismaClient();

db.$use(async (params, next) => {
  if (
    (params.model === 'User' && params.action === 'create') ||
    params.action === 'update'
  ) {
    if (params.args.data.password) {
      const hashedPassword = await hashPassword(params.args.data.password, 12);
      params.args.data.password = hashedPassword;
    }
  }
  return next(params);
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;

export default db;

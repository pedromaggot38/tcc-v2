import { PrismaClient } from '../generated/prisma/index.js';
import { hashPassword } from '../utils/controllers/userUtils.js';

const globalForPrisma = globalThis;
const db = globalForPrisma.prisma || new PrismaClient();

const removeNullFields = (obj) => {
  if (obj && typeof obj === 'object') {
    Object.entries(obj).forEach(([key, value]) => {
      if (value === null || value === undefined) {
        delete obj[key];
      } else if (typeof value === 'object') {
        removeNullFields(value);
      }
    });
  }
};

const hashUserPassword = async (params) => {
  if (params.args?.data?.password) {
    const hashedPassword = await hashPassword(params.args.data.password, 12);
    params.args.data.password = hashedPassword;
  }
};

const processResult = (result) => {
  const processItem = (item) => {
    if (item && typeof item === 'object') {
      removeNullFields(item);
    }
  };

  if (Array.isArray(result)) {
    result.forEach(processItem);
  } else {
    processItem(result);
  }
};

db.$use(async (params, next) => {
  if (params.model === 'User' && ['create', 'update'].includes(params.action)) {
    await hashUserPassword(params);
  }

  const result = await next(params);

  processResult(result);

  return result;
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;

export default db;

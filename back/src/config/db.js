import { PrismaClient } from '../generated/prisma/index.js';
import { hashPassword } from '../utils/controllers/userUtils.js';

const globalForPrisma = globalThis;
const db = globalForPrisma.prisma || new PrismaClient();

const removeNullFields = (obj) => {
  Object.keys(obj).forEach((key) => {
    const value = obj[key];
    if (value === null) {
      delete obj[key];
    } else if (typeof value === 'object' && !Array.isArray(value)) {
      removeNullFields(value);
    }
  });
};

db.$use(async (params, next) => {
  if (params.model === 'User' && ['create', 'update'].includes(params.action)) {
    if (params.args?.data?.password) {
      const hashedPassword = await hashPassword(params.args.data.password, 12);
      params.args.data.password = hashedPassword;
    }
  }

  if (
    params.model === 'User' &&
    ['findMany', 'findFirst', 'findUnique'].includes(params.action)
  ) {
    if (params.args?.select?.password) {
      // deixa passar, não faz nada
    } else {
      // remove se por acaso incluído
      delete params.args?.select?.password;
      delete params.args?.include?.password;
    }
  }

  const result = await next(params);

  const shouldRemovePassword = !(params.args?.select?.password === true);

  const processResult = (item) => {
    if (item && typeof item === 'object') {
      removeNullFields(item);
      if (shouldRemovePassword) {
        delete item.password;
      }
    }
  };

  if (Array.isArray(result)) {
    result.forEach(processResult);
  } else {
    processResult(result);
  }

  return result;
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;

export default db;

/*
import { PrismaClient } from '../generated/prisma/index.js';
import { hashPassword } from '../utils/controllers/userUtils.js';

const globalForPrisma = globalThis;
const db = globalForPrisma.prisma || new PrismaClient();

db.$use(async (params, next) => {
  if (params.model === 'User' && ['create', 'update'].includes(params.action)) {
    if (params.args.data && params.args.data.password) {
      const hashedPassword = await hashPassword(params.args.data.password, 12);
      params.args.data.password = hashedPassword;
    }
  }
  return next(params);
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;

export default db;


*/

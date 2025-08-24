import { PrismaClient } from '../generated/prisma/index.js';
import { hashPassword } from '../utils/controllers/userUtils.js';
import slugify from 'slugify';

const globalForPrisma = globalThis;

// Funções de lógica de negócio existentes
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

const generateArticleSlug = async (params, db) => {
  if (params.model === 'Article' && params.action === 'create') {
    const title = params.args?.data?.title;
    if (title) {
      const baseSlug = slugify(title, {
        lower: true,
        strict: true,
        replacement: '-',
        locale: 'pt',
      });

      let slug = baseSlug;
      let count = 1;

      while (await db.article.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${count++}`;
      }

      params.args.data.slug = slug;
    }
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

const prismaWithExtensions = new PrismaClient().$extends({
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        const params = {
          model,
          action: operation,
          args,
          runInTransaction: false,
        };

        // Lógica de pré-operação
        if (params.model === 'User' && ['create', 'update'].includes(params.action)) {
          await hashUserPassword(params);
        }

        if (params.model === 'Article' && params.action === 'create') {
          const localDb = prismaWithExtensions;
          await generateArticleSlug(params, localDb);
        }

        const result = await query(args);

        processResult(result);

        return result;
      },
    },
  },
});

const db = globalForPrisma.prisma || prismaWithExtensions;

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;

export default db;

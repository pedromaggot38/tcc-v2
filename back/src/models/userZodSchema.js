import { z } from 'zod';

const usernameRegex = /^[a-zA-Z0-9]+$/;

const PASSWORD_MIN_LENGTH = 4;
const NAME_MIN_LENGTH = 4;
const NAME_ERROR_MESSAGE = `O nome deve ter no mínimo ${NAME_MIN_LENGTH} caracteres`;
const PASSWORD_ERROR_MESSAGE = `A senha deve ter no mínimo ${PASSWORD_MIN_LENGTH} caracteres`;

const passwordFields = {
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, { error: PASSWORD_ERROR_MESSAGE }),
  passwordConfirm: z
    .string()
    .min(PASSWORD_MIN_LENGTH, { error: PASSWORD_ERROR_MESSAGE }),
};

const userProfileSchema = z.object({
  name: z
    .string()
    .min(NAME_MIN_LENGTH, { error: NAME_ERROR_MESSAGE })
    .optional(),
  email: z
    .preprocess(
      (val) => (val === '' || val === undefined ? null : val),
      z.email({ error: 'O formato do e-mail é inválido' }).nullable(),
    )
    .optional(),
  phone: z
    .string()
    .optional()
    .transform((val) => (val === '' || val === undefined ? null : val))
    .refine((val) => val === null || /^\d{1,11}$/.test(val), {
      message: 'O telefone deve conter apenas números e no máximo 11 dígitos',
    }),
  image: z
    .union([
      z.url({ error: 'O formato da URL da imagem é inválido' }),
      z.literal(''),
    ])
    .optional()
    .transform((val) => (val === '' ? null : val)),
});

export const loginSchema = z.strictObject({
  username: z
    .string()
    .min(4, { error: 'Nome de usuário é obrigatório' })
    .regex(usernameRegex, {
      message: 'O nome de usuário deve conter apenas letras e números',
    })
    .toLowerCase(),
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, { error: PASSWORD_ERROR_MESSAGE }),
});

export const createRootSchema = z
  .strictObject({
    username: z
      .string()
      .min(4, { error: 'Nome de usuário é obrigatório' })
      .regex(usernameRegex, {
        message: 'O nome de usuário deve conter apenas letras e números',
      })
      .toLowerCase(),
    name: z.string().min(NAME_MIN_LENGTH, { error: NAME_ERROR_MESSAGE }),
    email: z
      .email({ error: 'Email inválido' })
      .transform((val) => val.toLowerCase()),
    ...z.object(passwordFields).shape,
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'As senhas não coincidem',
    path: ['passwordConfirm'],
  })
  // eslint-disable-next-line no-unused-vars
  .transform(({ passwordConfirm, ...rest }) => rest);

export const createUserSchema = z
  .strictObject({
    username: z
      .string()
      .min(4, { error: 'Nome de usuário é obrigatório' })
      .regex(usernameRegex, {
        message: 'O nome de usuário deve conter apenas letras e números',
      })
      .toLowerCase(),
    name: z.string().min(NAME_MIN_LENGTH, { error: NAME_ERROR_MESSAGE }),
    email: z
      .email({ error: 'Email inválido' })
      .transform((val) => val.toLowerCase()),
    role: z.enum(['root', 'admin', 'journalist']).optional(),
    phone: z
      .string()
      .optional()
      .transform((val) => (val === '' || val === undefined ? null : val))
      .refine((val) => val === null || /^\d{1,11}$/.test(val), {
        message: 'O telefone deve conter apenas números e no máximo 11 dígitos',
      }),
    image: z
      .string()
      .transform((val) => (val === '' ? null : val))
      .refine((val) => val === null || /^https?:\/\/.+\..+/.test(val), {
        message: 'URL da imagem inválida',
      })
      .optional(),
    ...z.object(passwordFields).shape,
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'As senhas não coincidem',
    path: ['passwordConfirm'],
  })
  // eslint-disable-next-line no-unused-vars
  .transform(({ passwordConfirm, ...rest }) => rest);

export const updateMyPasswordSchema = z
  .strictObject({
    currentPassword: z
      .string()
      .min(1, { error: 'A senha atual é obrigatória' }),
    ...z.object(passwordFields).shape,
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'As senhas não coincidem',
    path: ['passwordConfirm'],
  })
  // eslint-disable-next-line no-unused-vars
  .transform(({ passwordConfirm, ...rest }) => rest);

export const updateUserPasswordAsRootSchema = z
  .strictObject({
    ...z.object(passwordFields).shape,
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'As senhas não coincidem',
    path: ['passwordConfirm'],
  })
  // eslint-disable-next-line no-unused-vars
  .transform(({ passwordConfirm, ...rest }) => rest);

export const updateUserSchema = z.strictObject({
  ...userProfileSchema.shape,
  role: z.enum(['root', 'admin', 'journalist']).optional(),
  active: z.boolean().optional(),
});

export const forgotPasswordSchema = z.strictObject({
  username: z
    .string()
    .min(4, { error: 'Nome de usuário é obrigatório' })
    .regex(usernameRegex, {
      message: 'O nome de usuário deve conter apenas letras e números',
    })
    .toLowerCase(),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, { message: 'O código token é obrigatório' }),
    ...passwordFields,
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'As senhas não coincidem',
    path: ['passwordConfirm'],
  });

export const transferRootRoleConfirmationSchema = z.strictObject({
  targetUsername: z
    .string()
    .min(1, { error: 'O nome de usuário do alvo é obrigatório' }),
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, { error: PASSWORD_ERROR_MESSAGE }),
});

export const deleteUserConfirmationSchema = z.strictObject({
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, { error: PASSWORD_ERROR_MESSAGE }),
});

export const updateMeSchema = z.strictObject({
  ...userProfileSchema.shape,
});

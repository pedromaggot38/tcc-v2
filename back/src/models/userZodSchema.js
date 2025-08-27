import { z } from 'zod';

const usernameRegex = /^[a-zA-Z0-9]+$/;

const PASSWORD_MIN_LENGTH = 4;
const NAME_MIN_LENGTH = 4;
const NAME_ERROR_MESSAGE = `O nome deve ter no mínimo ${NAME_MIN_LENGTH} caracteres`;
const PASSWORD_ERROR_MESSAGE = `A senha deve ter no mínimo ${PASSWORD_MIN_LENGTH} caracteres`;

const userProfileSchema = {
  name: z.string().min(NAME_MIN_LENGTH, NAME_ERROR_MESSAGE).optional(),
  email: z
    .preprocess(
      (val) => (val === '' || val === undefined ? null : val),
      z
        .string()
        .email({ message: 'O formato do e-mail é inválido' })
        .nullable(),
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
    .string()
    .url({ message: 'O formato da URL da imagem é inválido' })
    .or(z.literal(''))
    .optional()
    .transform((val) => (val === '' ? null : val)),
};

export const createRootZodSchema = z
  .object({
    username: z
      .string()
      .min(4, 'Nome de usuário é obrigatório')
      .regex(
        usernameRegex,
        'O nome de usuário deve conter apenas letras e números',
      )
      .toLowerCase(),
    password: z.string().min(PASSWORD_MIN_LENGTH, PASSWORD_ERROR_MESSAGE),
    passwordConfirm: z
      .string()
      .min(PASSWORD_MIN_LENGTH, PASSWORD_ERROR_MESSAGE),
    name: z.string().min(NAME_MIN_LENGTH, NAME_ERROR_MESSAGE),
    email: z.string().email('Email inválido').toLowerCase(),
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
  })
  .strict()
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'As senhas não coincidem',
    path: ['passwordConfirm'],
  });

export const createUserZodSchema = z
  .object({
    username: z
      .string()
      .min(4, 'Nome de usuário é obrigatório')
      .regex(
        usernameRegex,
        'O nome de usuário deve conter apenas letras e números',
      )
      .toLowerCase(),
    password: z.string().min(PASSWORD_MIN_LENGTH, PASSWORD_ERROR_MESSAGE),
    passwordConfirm: z
      .string()
      .min(PASSWORD_MIN_LENGTH, PASSWORD_ERROR_MESSAGE),
    name: z.string().min(NAME_MIN_LENGTH, NAME_ERROR_MESSAGE),
    email: z.string().email('Email inválido').toLowerCase(),
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
  })
  .strict()
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'As senhas não coincidem',
    path: ['passwordConfirm'],
  });

export const updateMeZodSchema = z.object(userProfileSchema).strict();

export const updateUserZodSchema = z
  .object({
    ...userProfileSchema,
    role: z.enum(['root', 'admin', 'journalist']).optional(),
    active: z.boolean().optional(),
  })
  .strict();

export const updateMyPasswordZodSchema = z
  .object({
    password: z.string().min(PASSWORD_MIN_LENGTH, PASSWORD_ERROR_MESSAGE),
    passwordConfirm: z
      .string()
      .min(PASSWORD_MIN_LENGTH, PASSWORD_ERROR_MESSAGE),
    currentPassword: z.string().min(1, 'A senha atual é obrigatória'),
  })
  .strict()
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'As senhas não coincidem',
    path: ['passwordConfirm'],
  });

export const updateUserPasswordAsRootZodSchema = z
  .object({
    password: z.string().min(PASSWORD_MIN_LENGTH, PASSWORD_ERROR_MESSAGE),
    passwordConfirm: z
      .string()
      .min(PASSWORD_MIN_LENGTH, PASSWORD_ERROR_MESSAGE),
  })
  .strict()
  .refine((data) => data.password === data.passwordConfirm, {
    path: ['passwordConfirm'],
    message: 'As senhas não coincidem',
  });

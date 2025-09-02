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
const passwordConfirmationSchema = z
  .object({
    password: z.string().min(PASSWORD_MIN_LENGTH, PASSWORD_ERROR_MESSAGE),
    passwordConfirm: z
      .string()
      .min(PASSWORD_MIN_LENGTH, PASSWORD_ERROR_MESSAGE),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'As senhas não coincidem',
    path: ['passwordConfirm'],
  })
  .transform((data) => {
    const { passwordConfirm, ...rest } = data;
    return rest;
  });

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
  .merge(passwordConfirmationSchema)
  .strict();

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
  .merge(passwordConfirmationSchema)
  .strict();

export const updateMyPasswordZodSchema = z
  .object({
    currentPassword: z.string().min(1, 'A senha atual é obrigatória'),
  })
  .merge(passwordConfirmationSchema)
  .strict();

export const updateUserPasswordAsRootZodSchema = z
  .object({})
  .merge(passwordConfirmationSchema)
  .strict();

export const updateUserZodSchema = z
  .object({
    ...userProfileSchema,
    role: z.enum(['root', 'admin', 'journalist']).optional(),
    active: z.boolean().optional(),
  })
  .strict();

export const forgotPasswordSchema = z.object({
  username: z
    .string()
    .min(4, 'Nome de usuário é obrigatório')
    .regex(
      usernameRegex,
      'O nome de usuário deve conter apenas letras e números',
    )
    .toLowerCase(),
});

export const resetPasswordSchema = z
  .object({})
  .merge(passwordConfirmationSchema)
  .strict();

export const updateMeZodSchema = z.object(userProfileSchema).strict();

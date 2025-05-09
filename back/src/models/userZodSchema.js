import { z } from 'zod';

const usernameRegex = /^[a-zA-Z0-9]+$/;

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
    password: z.string().min(4, 'Senha é obrigatória'),
    passwordConfirm: z.string().min(4, 'Senha de confirmação é obrigatória'),
    name: z.string().min(1, 'Nome é obrigatório'),
    email: z.string().email('Email inválido').toLowerCase(),
    phone: z
      .string()
      .max(9, 'O telefone deve conter no máximo 9 dígitos numéricos')
      .optional()
      .transform((val) => (val === '' ? null : val))
      .refine((val) => val === null || /^\d+$/.test(val), {
        message: 'O telefone deve conter apenas números',
      }),
    image: z
      .string()
      .transform((val) => (val === '' ? null : val))
      .refine((val) => val === null || /^https?:\/\/.+\..+/.test(val), {
        message: 'URL da imagem inválida',
      })
      .optional(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'As senhas não coincidem',
    path: ['passwordConfirm'],
  });

export const createUserAsRootZodSchema = z
  .object({
    username: z
      .string()
      .min(4, 'Nome de usuário é obrigatório')
      .regex(
        usernameRegex,
        'O nome de usuário deve conter apenas letras e números',
      )
      .toLowerCase(),
    password: z.string().min(4, 'Senha é obrigatória'),
    passwordConfirm: z.string().min(4, 'Senha de confirmação é obrigatória'),
    name: z.string().min(1, 'Nome é obrigatório'),
    email: z.string().email('Email inválido').toLowerCase(),
    role: z.enum(['root', 'admin', 'journalist']).optional(),
    phone: z
      .string()
      .max(9, 'O telefone deve conter no máximo 9 dígitos numéricos')
      .optional()
      .transform((val) => (val === '' ? null : val))
      .refine((val) => val === null || /^\d+$/.test(val), {
        message: 'O telefone deve conter apenas números',
      }),
    image: z
      .string()
      .transform((val) => (val === '' ? null : val))
      .refine((val) => val === null || /^https?:\/\/.+\..+/.test(val), {
        message: 'URL da imagem inválida',
      })
      .optional(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'As senhas não coincidem',
    path: ['passwordConfirm'],
  });

export const updateMeZodSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').optional(),
  email: z
    .string()
    .optional()
    .transform((val) => (val === '' ? null : val))
    .refine(
      (val) =>
        val === null ||
        /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(val),
      {
        message: 'Email inválido',
      },
    ),
  phone: z
    .string()
    .max(9, 'O telefone deve conter no máximo 9 dígitos numéricos')
    .optional()
    .transform((val) => (val === '' ? null : val))
    .refine((val) => val === null || /^\d+$/.test(val), {
      message: 'O telefone deve conter apenas números',
    }),
  image: z
    .string()
    .transform((val) => (val === '' ? null : val))
    .refine((val) => val === null || /^https?:\/\/.+\..+/.test(val), {
      message: 'URL da imagem inválida',
    })
    .optional(),
});

export const updateUserAsRootZodSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').optional(),
  email: z
    .string()
    .optional()
    .transform((val) => (val === '' ? null : val))
    .refine(
      (val) =>
        val === null ||
        /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(val),
      {
        message: 'Email inválido',
      },
    ),
  phone: z
    .string()
    .max(9, 'O telefone deve conter no máximo 9 dígitos numéricos')
    .optional()
    .transform((val) => (val === '' ? null : val))
    .refine((val) => val === null || /^\d+$/.test(val), {
      message: 'O telefone deve conter apenas números',
    }),
  image: z
    .string()
    .transform((val) => (val === '' ? null : val))
    .refine((val) => val === null || /^https?:\/\/.+\..+/.test(val), {
      message: 'URL da imagem inválida',
    })
    .optional(),
  role: z.enum(['root', 'admin', 'journalist']).optional(),
  active: z.boolean().optional(),
});

export const updateMyPasswordZodSchema = z
  .object({
    password: z.string().min(4, 'A senha deve ter no mínimo 6 caracteres'),
    passwordConfirm: z
      .string()
      .min(4, 'A confirmação de senha deve ter no mínimo 6 caracteres'),
    currentPassword: z.string().min(4, 'A senha atual é obrigatória'),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'As senhas não coincidem',
    path: ['passwordConfirm'],
  });

export const updateUserPasswordAsRootZodSchema = z
  .object({
    password: z.string().min(4, 'Senha é obrigatória'),
    passwordConfirm: z.string().min(4, 'Senha de confirmação é obrigatória'),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    path: ['passwordConfirm'],
    message: 'As senhas não coincidem',
  });

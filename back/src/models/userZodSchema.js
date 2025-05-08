import { z } from 'zod';

export const createRootZodSchema = z
  .object({
    username: z.string().min(1, 'Nome de usuário é obrigatório').toLowerCase(),
    password: z.string().min(4, 'Senha é obrigatória'),
    passwordConfirm: z.string().min(4, 'Senha de confirmação é obrigatória'),
    name: z.string().min(1, 'Nome é obrigatório'),
    email: z.string().email('Email inválido').toLowerCase(),
    phone: z
      .string()
      .optional()
      .transform((val) => (val === '' ? null : val)),
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
    username: z.string().min(1, 'Nome de usuário é obrigatório').toLowerCase(),
    password: z.string().min(4, 'Senha é obrigatória'),
    passwordConfirm: z.string().min(4, 'Senha de confirmação é obrigatória'),
    name: z.string().min(1, 'Nome é obrigatório'),
    email: z.string().email('Email inválido').toLowerCase(),
    phone: z
      .string()
      .optional()
      .transform((val) => (val === '' ? null : val)),
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

export const updateUserZodSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').optional(),
  email: z.string().email('Email inválido').toLowerCase().optional(),
  phone: z
    .string()
    .optional()
    .transform((val) => (val === '' ? null : val)),
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
  email: z.string().email('Email inválido').toLowerCase().optional(),
  phone: z
    .string()
    .optional()
    .transform((val) => (val === '' ? null : val)),
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

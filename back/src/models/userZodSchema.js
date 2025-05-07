import { z } from 'zod';

const phoneRegex = /^\(?\d{2}\)?[\s-]?(9\d{4})-?(\d{4})$/;

export const userCreateZodSchema = z
  .object({
    username: z.string().min(1, 'Nome de usuário é obrigatório'),
    password: z.string().min(4, 'Senha é obrigatória'),
    passwordConfirm: z.string().min(4, 'Senha de confirmação é obrigatória'),
    email: z.string().email('Email inválido'),
    name: z.string().min(1, 'Nome é obrigatório'),
    phone: z
      .string()
      .optional()
      .transform((val) => (val === '' ? null : val))
      .refine((val) => val === null || phoneRegex.test(val), {
        message: 'Telefone inválido',
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
    message: 'As senhas não são iguais',
    path: ['passwordConfirm'],
  });

export const updateUserZodSchema = z.object({
  email: z.string().email('Email inválido').optional(),
  name: z.string().min(1, 'Nome é obrigatório').optional(),
  phone: z
    .string()
    .optional()
    .transform((val) => (val === '' ? null : val))
    .refine((val) => val === null || phoneRegex.test(val), {
      message: 'Telefone inválido',
    }),
  image: z
    .string()
    .transform((val) => (val === '' ? null : val))
    .refine((val) => val === null || /^https?:\/\/.+\..+/.test(val), {
      message: 'URL da imagem inválida',
    })
    .optional(),
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
    message: 'As senhas não são iguais',
    path: ['passwordConfirm'],
  });

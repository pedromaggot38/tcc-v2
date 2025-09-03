import { z } from 'zod';

export const createArticleZodSchema = z
  .object({
    title: z.string().min(1, 'Título é obrigatório'),
    subtitle: z.string().optional(),
    content: z.string().optional(),
    author: z.string().min(1, 'Autor é obrigatório'),
    imageUrl: z
      .string()
      .url('Url da imagem inválida')
      .or(z.literal(''))
      .optional()
      .transform((val) => (val === '' ? null : val)),
    imageDescription: z.string().optional(),
    status: z.enum(['published', 'draft']).default('draft'),
  })
  .strict();

export const updateArticleZodSchema = createArticleZodSchema.partial().strict();

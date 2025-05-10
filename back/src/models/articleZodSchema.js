import { z } from 'zod';

export const createArticleZodSchema = z.object({
  title: z.string().min(4, 'Título é obrigatório'),
  subtitle: z.string().optional(),
  content: z.string().optional(),
  author: z.string().min(4, 'Autor é obrigatório'),
  imageUrl: z.string().url('Url da imagem inválida').optional(),
  imageDescription: z.string().optional(),
  status: z.enum(['published', 'draft']).default('draft'),
});

export const updateArticleZodSchema = createArticleZodSchema.partial();

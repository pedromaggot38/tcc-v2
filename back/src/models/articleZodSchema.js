import { z } from 'zod';

export const articleZodSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  subtitle: z.string().optional(),
  content: z.string().optional(),
  author: z.string().min(1, 'Autor é obrigatório'),
  imageUrl: z.string().url('Url da imagem inválida').optional(),
  imageDescription: z.string().optional(),
  userId: z.string().min(1, 'ID não encontrado'),
  status: z.enum(['published', 'draft', 'archived']).default('draft'),
  lastModifiedBy: z.string().optional(),
});

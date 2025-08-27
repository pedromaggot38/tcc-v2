import { z } from 'zod';

export const createDoctorZodSchema = z
  .object({
    name: z.string().min(1, 'Nome é obrigatório'),
    specialty: z.string().min(1, 'Especialidade é obrigária'),
    state: z.enum(
      [
        'AC',
        'AL',
        'AP',
        'AM',
        'BA',
        'CE',
        'DF',
        'ES',
        'GO',
        'MA',
        'MT',
        'MS',
        'MG',
        'PA',
        'PB',
        'PR',
        'PE',
        'PI',
        'RJ',
        'RN',
        'RS',
        'RO',
        'RR',
        'SC',
        'SP',
        'SE',
        'TO',
      ],
      { errorMap: () => ({ message: 'Estado inválido' }) },
    ),
    crm: z.string().min(1, 'CRM é obrigatório').max(8),
    phone: z
      .string()
      .optional()
      .transform((val) => (val === '' || val === undefined ? null : val))
      .refine((val) => val === null || /^\d{1,11}$/.test(val), {
        message: 'O telefone deve conter apenas números e no máximo 10 dígitos',
      }),
    email: z.string().email('E-mail inválido').optional(),
    schedules: z.array(
      z
        .object({
          dayOfWeek: z.enum([
            'segunda',
            'terca',
            'quarta',
            'quinta',
            'sexta',
            'sabado',
            'domingo',
          ]),
          startTime: z
            .string()
            .regex(/^([0-1]\d|2[0-3]):[0-5]\d$/, 'Formato inválido (HH:mm)'),
          endTime: z
            .string()
            .regex(/^([0-1]\d|2[0-3]):[0-5]\d$/, 'Formato inválido (HH:mm)'),
        })
        .strict(),
    ),
  })
  .strict();

export const updateDoctorZodSchema = createDoctorZodSchema.partial().strict();

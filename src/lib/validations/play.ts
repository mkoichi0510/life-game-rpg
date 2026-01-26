import { z } from 'zod'
import { dayKeySchema } from './result'

export const getPlaysQuerySchema = z.object({
  dayKey: dayKeySchema,
  categoryId: z.string().trim().optional(),
})

export const createPlaySchema = z.object({
  actionId: z
    .string({ required_error: 'アクションIDは必須です' })
    .trim()
    .min(1, 'アクションIDは必須です'),
  note: z
    .string()
    .optional()
    .transform((v) => {
      const trimmed = v?.trim()
      return trimmed && trimmed.length > 0 ? trimmed : undefined
    }),
})

export const playIdParamSchema = z.object({
  id: z
    .string({ required_error: 'プレイログIDは必須です' })
    .trim()
    .min(1, 'プレイログIDは必須です'),
})

export type GetPlaysQueryInput = z.infer<typeof getPlaysQuerySchema>
export type CreatePlayInput = z.infer<typeof createPlaySchema>

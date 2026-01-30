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
  quantity: z
    .number({ invalid_type_error: '数量は整数で指定してください' })
    .int('数量は整数で指定してください')
    .positive('数量は正の整数で指定してください')
    .optional(),
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

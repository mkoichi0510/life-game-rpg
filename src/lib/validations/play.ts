import { z } from 'zod'

const dayKeyRegex = /^\d{4}-\d{2}-\d{2}$/

export const getPlaysQuerySchema = z.object({
  dayKey: z
    .string({ required_error: '日付は必須です' })
    .trim()
    .min(1, '日付は必須です')
    .regex(dayKeyRegex, '日付はYYYY-MM-DD形式で指定してください')
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

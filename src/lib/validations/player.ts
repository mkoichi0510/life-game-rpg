import { z } from 'zod'

export const categoryIdParamSchema = z.object({
  categoryId: z
    .string({ required_error: 'カテゴリIDは必須です' })
    .trim()
    .min(1, 'カテゴリIDは必須です'),
})

export const getSpendLogsQuerySchema = z.object({
  categoryId: z
    .string({ required_error: 'カテゴリIDは必須です' })
    .trim()
    .min(1, 'カテゴリIDは必須です'),
})

export type CategoryIdParamInput = z.infer<typeof categoryIdParamSchema>
export type GetSpendLogsQueryInput = z.infer<typeof getSpendLogsQuerySchema>

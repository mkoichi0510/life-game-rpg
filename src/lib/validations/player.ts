import { z } from 'zod'

export const categoryIdParamSchema = z.object({
  categoryId: z
    .string({ required_error: 'カテゴリIDは必須です' })
    .trim()
    .min(1, 'カテゴリIDは必須です'),
})

export type CategoryIdParamInput = z.infer<typeof categoryIdParamSchema>

const cursorSchema = z
  .string({ required_error: 'cursorは必須です' })
  .trim()
  .min(1, 'cursorは必須です')
  .refine((value) => {
    const [atPart, ...idParts] = value.split('__')
    if (!atPart || idParts.length === 0 || idParts.join('__').length === 0) {
      return false
    }
    return !Number.isNaN(Date.parse(atPart))
  }, 'cursorが不正です')

export const spendLogsQuerySchema = z.object({
  categoryId: z.string().trim().min(1, 'カテゴリIDは必須です').optional(),
  limit: z
    .coerce.number({ invalid_type_error: 'limitは数値で指定してください' })
    .int('limitは整数で指定してください')
    .min(1, 'limitは1以上で指定してください')
    .max(100, 'limitは100以下で指定してください')
    .optional()
    .default(20),
  cursor: cursorSchema.optional(),
})

export type SpendLogsQueryInput = z.infer<typeof spendLogsQuerySchema>

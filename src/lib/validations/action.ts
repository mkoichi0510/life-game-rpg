import { z } from 'zod'

export const getActionsQuerySchema = z.object({
  categoryId: z
    .string({ required_error: 'カテゴリIDは必須です' })
    .min(1, 'カテゴリIDは必須です')
    .transform((v) => v.trim()),
  visible: z
    .string()
    .optional()
    .transform((v) => (v === 'true' ? true : undefined)),
})

export const createActionSchema = z.object({
  categoryId: z
    .string({ required_error: 'カテゴリIDは必須です' })
    .min(1, 'カテゴリIDは必須です')
    .transform((v) => v.trim()),
  label: z
    .string({ required_error: 'アクション名は必須です' })
    .min(1, 'アクション名は必須です')
    .max(50, 'アクション名は最大50文字までです')
    .transform((v) => v.trim()),
  unit: z
    .string()
    .max(10, '単位は最大10文字までです')
    .optional()
    .transform((v) => {
      const trimmed = v?.trim()
      return trimmed && trimmed.length > 0 ? trimmed : undefined
    }),
  visible: z.boolean().optional().default(true),
  order: z
    .number({ invalid_type_error: '表示順序は整数で指定してください' })
    .int('表示順序は整数で指定してください')
    .optional()
    .default(0),
})

export type GetActionsQueryInput = z.infer<typeof getActionsQuerySchema>
export type CreateActionInput = z.infer<typeof createActionSchema>

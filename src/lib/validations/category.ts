import { z } from 'zod'

export const createCategorySchema = z.object({
  name: z
    .string({ required_error: 'カテゴリ名は必須です' })
    .min(1, 'カテゴリ名は必須です')
    .max(50, 'カテゴリ名は最大50文字までです')
    .transform((v) => v.trim()),
  visible: z.boolean().optional().default(true),
  order: z
    .number({ invalid_type_error: '表示順序は整数で指定してください' })
    .int('表示順序は整数で指定してください')
    .optional()
    .default(0),
  rankWindowDays: z
    .number({ invalid_type_error: 'ランク判定期間は1以上の整数で指定してください' })
    .int('ランク判定期間は1以上の整数で指定してください')
    .min(1, 'ランク判定期間は1以上の整数で指定してください')
    .optional()
    .default(7),
  xpPerPlay: z
    .number({ invalid_type_error: 'プレイ当たりXPは1以上の整数で指定してください' })
    .int('プレイ当たりXPは1以上の整数で指定してください')
    .min(1, 'プレイ当たりXPは1以上の整数で指定してください')
    .optional()
    .default(10),
  xpPerSp: z
    .number({ invalid_type_error: 'SP変換に必要なXPは1以上の整数で指定してください' })
    .int('SP変換に必要なXPは1以上の整数で指定してください')
    .min(1, 'SP変換に必要なXPは1以上の整数で指定してください')
    .optional()
    .default(20),
})

export type CreateCategoryInput = z.infer<typeof createCategorySchema>

export const updateCategorySchema = z.object({
  visible: z.boolean().optional(),
})

export const categoryIdParamSchema = z.object({
  id: z.string().min(1, 'カテゴリIDは必須です'),
})

export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>

import { z } from 'zod'

const dayKeyRegex = /^\d{4}-\d{2}-\d{2}$/

/**
 * 日付文字列が実際に存在する日付かどうかを検証
 * 例: 2026-02-30 や 2026-13-01 は false
 */
const isValidDate = (dateStr: string): boolean => {
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  )
}

/**
 * dayKey (YYYY-MM-DD形式) の共通バリデーションスキーマ
 * - 形式チェック (正規表現)
 * - 存在チェック (2026-02-30等を弾く)
 */
export const dayKeySchema = z
  .string({ required_error: '日付は必須です' })
  .trim()
  .min(1, '日付は必須です')
  .regex(dayKeyRegex, '日付はYYYY-MM-DD形式で指定してください')
  .refine(isValidDate, '有効な日付を指定してください')

export const dayKeyParamSchema = z.object({
  dayKey: dayKeySchema,
})

export type DayKeyParamInput = z.infer<typeof dayKeyParamSchema>

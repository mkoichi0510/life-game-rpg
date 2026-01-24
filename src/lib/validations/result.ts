import { z } from 'zod'

const dayKeyRegex = /^\d{4}-\d{2}-\d{2}$/

export const dayKeyParamSchema = z.object({
  dayKey: z
    .string({ required_error: '日付は必須です' })
    .trim()
    .min(1, '日付は必須です')
    .regex(dayKeyRegex, '日付はYYYY-MM-DD形式で指定してください'),
})

export type DayKeyParamInput = z.infer<typeof dayKeyParamSchema>

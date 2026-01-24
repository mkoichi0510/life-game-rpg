import { z } from 'zod'

const requiredId = (label: string) =>
  z
    .string({ required_error: `${label}は必須です` })
    .trim()
    .min(1, `${label}は必須です`)

export const seasonalTitlesQuerySchema = z.object({
  categoryId: requiredId('カテゴリID'),
})

export type SeasonalTitlesQueryInput = z.infer<typeof seasonalTitlesQuerySchema>

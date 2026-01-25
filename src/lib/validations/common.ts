import { z } from 'zod'

export const requiredId = (label: string) =>
  z
    .string({ required_error: `${label}は必須です` })
    .trim()
    .min(1, `${label}は必須です`)

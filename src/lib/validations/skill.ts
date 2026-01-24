import { z } from 'zod'

const requiredId = (label: string) =>
  z
    .string({ required_error: `${label}は必須です` })
    .trim()
    .min(1, `${label}は必須です`)

export const skillTreesQuerySchema = z.object({
  categoryId: requiredId('カテゴリID'),
})

export const skillNodesQuerySchema = z.object({
  treeId: requiredId('ツリーID'),
})

export const skillNodeIdParamSchema = z.object({
  id: requiredId('ノードID'),
})

export const seasonalTitlesQuerySchema = z.object({
  categoryId: requiredId('カテゴリID'),
})

export type SkillTreesQueryInput = z.infer<typeof skillTreesQuerySchema>
export type SkillNodesQueryInput = z.infer<typeof skillNodesQuerySchema>
export type SkillNodeIdParamInput = z.infer<typeof skillNodeIdParamSchema>
export type SeasonalTitlesQueryInput = z.infer<typeof seasonalTitlesQuerySchema>

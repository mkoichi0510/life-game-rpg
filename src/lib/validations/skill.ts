import { z } from 'zod'
import { requiredId } from '@/lib/validations/common'

export const skillTreesQuerySchema = z.object({
  categoryId: requiredId('カテゴリID'),
})

export const skillTreeIdParamSchema = z.object({
  id: requiredId('ツリーID'),
})

export const skillNodeIdParamSchema = z.object({
  id: requiredId('ノードID'),
})

export const skillNodesQuerySchema = z.object({
  treeId: requiredId('ツリーID'),
})

export const seasonalTitlesQuerySchema = z.object({
  categoryId: requiredId('カテゴリID'),
})

export type SkillTreesQueryInput = z.infer<typeof skillTreesQuerySchema>
export type SkillTreeIdParamInput = z.infer<typeof skillTreeIdParamSchema>
export type SkillNodeIdParamInput = z.infer<typeof skillNodeIdParamSchema>
export type SkillNodesQueryInput = z.infer<typeof skillNodesQuerySchema>
export type SeasonalTitlesQueryInput = z.infer<typeof seasonalTitlesQuerySchema>

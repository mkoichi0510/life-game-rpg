import { NextRequest, NextResponse } from 'next/server'
import { skillNodeIdParamSchema } from '@/lib/validations/skill'
import {
  formatAlreadyUnlockedError,
  formatInsufficientSpError,
  formatInternalError,
  formatNotFoundError,
  formatPrerequisiteNotMetError,
  formatZodError,
} from '@/lib/validations/helpers'
import {
  unlockNode,
  AlreadyUnlockedError,
  InsufficientSpError,
  PrerequisiteNotMetError,
  SkillNodeNotFoundError,
  PlayerStateNotFoundError,
} from '@/lib/domains'
import { requireUser, isUserFailure } from '@/lib/api/requireUser'

/**
 * POST /api/skills/nodes/:id/unlock
 * スキルノードを解放
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id?: string }> }
) {
  try {
    const userResult = await requireUser()
    if (isUserFailure(userResult)) {
      return userResult.response
    }

    const { id } = await params
    const result = skillNodeIdParamSchema.safeParse({ id: id ?? '' })

    if (!result.success) {
      return formatZodError(result.error)
    }

    const data = await unlockNode(userResult.userId, result.data.id)
    return NextResponse.json({ unlockedNode: data.unlockedNode })
  } catch (error) {
    if (error instanceof SkillNodeNotFoundError) {
      return formatNotFoundError('スキルノード', error.nodeId)
    }

    if (error instanceof PlayerStateNotFoundError) {
      return formatNotFoundError('プレイヤーステート', error.categoryId)
    }

    if (error instanceof AlreadyUnlockedError) {
      return formatAlreadyUnlockedError(error.nodeId)
    }

    if (error instanceof InsufficientSpError) {
      return formatInsufficientSpError(
        error.required,
        error.available,
        error.nodeId
      )
    }

    if (error instanceof PrerequisiteNotMetError) {
      return formatPrerequisiteNotMetError(
        error.nodeId,
        error.prerequisiteNodeId
      )
    }

    console.error('Failed to unlock skill node:', error)
    return formatInternalError('スキルノードの解放に失敗しました')
  }
}

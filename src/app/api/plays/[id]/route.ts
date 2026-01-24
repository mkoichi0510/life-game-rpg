import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculateSpFromXp, calculateXpEarned } from '@/lib/calculation'
import { playIdParamSchema } from '@/lib/validations/play'
import {
  formatInternalError,
  formatNotFoundError,
  formatZodError,
} from '@/lib/validations/helpers'

/**
 * DELETE /api/plays/:id
 * プレイログを削除
 */
export async function DELETE(
  _request: Request,
  { params }: { params: { id?: string } }
) {
  try {
    const result = playIdParamSchema.safeParse({ id: params.id ?? '' })

    if (!result.success) {
      return formatZodError(result.error)
    }

    const playLog = await prisma.playLog.findUnique({
      where: { id: result.data.id },
      select: {
        id: true,
        dayKey: true,
        action: {
          select: {
            categoryId: true,
            category: {
              select: {
                xpPerPlay: true,
                xpPerSp: true,
              },
            },
          },
        },
      },
    })

    if (!playLog) {
      return formatNotFoundError('プレイログ', result.data.id)
    }

    const dailyResult = await prisma.dailyResult.findUnique({
      where: { dayKey: playLog.dayKey },
      select: { status: true },
    })

    if (dailyResult?.status === 'confirmed') {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_OPERATION',
            message: '確定済みの日付のプレイは削除できません',
          },
        },
        { status: 400 }
      )
    }

    await prisma.$transaction(async (tx) => {
      const categoryResult = await tx.dailyCategoryResult.findUnique({
        where: {
          dayKey_categoryId: {
            dayKey: playLog.dayKey,
            categoryId: playLog.action.categoryId,
          },
        },
        select: { id: true, playCount: true },
      })

      if (!categoryResult) {
        throw new Error('DailyCategoryResult not found for play log')
      }

      const nextPlayCount = Math.max(0, categoryResult.playCount - 1)
      const xpEarned = calculateXpEarned(
        nextPlayCount,
        playLog.action.category.xpPerPlay
      )
      const spEarned = calculateSpFromXp(
        xpEarned,
        playLog.action.category.xpPerSp
      )

      await tx.dailyCategoryResult.update({
        where: { id: categoryResult.id },
        data: {
          playCount: nextPlayCount,
          xpEarned,
          spEarned,
        },
      })

      await tx.playLog.delete({
        where: { id: playLog.id },
      })
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Failed to delete play log:', error)
    return formatInternalError('プレイログの削除に失敗しました')
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { formatDayKey, getNextDayKey } from '@/lib/date'
import { calculateSpFromXp, calculateXpEarned } from '@/lib/calculation'
import { createPlaySchema, getPlaysQuerySchema } from '@/lib/validations/play'
import {
  formatInternalError,
  formatNotFoundError,
  formatZodError,
} from '@/lib/validations/helpers'

const playLogInclude = {
  action: {
    select: {
      id: true,
      label: true,
      categoryId: true,
      category: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
}

/**
 * GET /api/plays
 * 日別プレイログ一覧を取得
 * クエリパラメータ:
 *   - dayKey: 対象日（必須, YYYY-MM-DD）
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = {
      dayKey: searchParams.get('dayKey') ?? '',
      categoryId: searchParams.get('categoryId') ?? undefined,
    }
    const result = getPlaysQuerySchema.safeParse(query)

    if (!result.success) {
      return formatZodError(result.error)
    }

    const playLogs = await prisma.playLog.findMany({
      where: {
        dayKey: result.data.dayKey,
        ...(result.data.categoryId && {
          action: { categoryId: result.data.categoryId },
        }),
      },
      orderBy: [{ at: 'asc' }, { id: 'asc' }],
      include: playLogInclude,
    })

    return NextResponse.json({ playLogs })
  } catch (error) {
    console.error('Failed to fetch play logs:', error)
    return formatInternalError('プレイログの取得に失敗しました')
  }
}

/**
 * POST /api/plays
 * プレイログを新規作成
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const result = createPlaySchema.safeParse(body)

    if (!result.success) {
      return formatZodError(result.error)
    }

    const action = await prisma.action.findUnique({
      where: { id: result.data.actionId },
      select: {
        id: true,
        categoryId: true,
        category: {
          select: {
            id: true,
            xpPerPlay: true,
            xpPerSp: true,
          },
        },
      },
    })

    if (!action) {
      return formatNotFoundError('アクション', result.data.actionId)
    }

    const now = new Date()
    const todayKey = formatDayKey(now)
    const todayResult = await prisma.dailyResult.findUnique({
      where: { dayKey: todayKey },
      select: { status: true },
    })

    const targetDayKey =
      todayResult?.status === 'confirmed'
        ? getNextDayKey(todayKey)
        : todayKey

    const playLog = await prisma.$transaction(async (tx) => {
      await tx.dailyResult.upsert({
        where: { dayKey: targetDayKey },
        create: { dayKey: targetDayKey },
        update: {},
      })

      const createdPlayLog = await tx.playLog.create({
        data: {
          at: now,
          dayKey: targetDayKey,
          actionId: action.id,
          note: result.data.note,
        },
        include: playLogInclude,
      })

      const existingCategoryResult = await tx.dailyCategoryResult.findUnique({
        where: {
          dayKey_categoryId: {
            dayKey: targetDayKey,
            categoryId: action.categoryId,
          },
        },
        select: { id: true, playCount: true },
      })

      const nextPlayCount = (existingCategoryResult?.playCount ?? 0) + 1
      const xpEarned = calculateXpEarned(
        nextPlayCount,
        action.category.xpPerPlay
      )
      const spEarned = calculateSpFromXp(xpEarned, action.category.xpPerSp)

      if (existingCategoryResult) {
        await tx.dailyCategoryResult.update({
          where: { id: existingCategoryResult.id },
          data: {
            playCount: nextPlayCount,
            xpEarned,
            spEarned,
            playLogs: { connect: { id: createdPlayLog.id } },
          },
        })
      } else {
        await tx.dailyCategoryResult.create({
          data: {
            dayKey: targetDayKey,
            categoryId: action.categoryId,
            playCount: nextPlayCount,
            xpEarned,
            spEarned,
            playLogs: { connect: { id: createdPlayLog.id } },
          },
        })
      }

      return createdPlayLog
    })

    return NextResponse.json({ playLog }, { status: 201 })
  } catch (error) {
    console.error('Failed to create play log:', error)
    return formatInternalError('プレイログの作成に失敗しました')
  }
}

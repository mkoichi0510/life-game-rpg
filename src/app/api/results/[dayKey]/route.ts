import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { DAILY_RESULT_STATUS } from '@/lib/constants'
import { dayKeyParamSchema } from '@/lib/validations/result'
import { formatInternalError, formatZodError } from '@/lib/validations/helpers'
import { autoConfirmRecentDays } from '@/lib/domains/result'

/**
 * GET /api/results/:dayKey
 * 日次リザルトを取得
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ dayKey?: string }> }
) {
  try {
    const { dayKey } = await params
    const result = dayKeyParamSchema.safeParse({ dayKey: dayKey ?? '' })

    if (!result.success) {
      return formatZodError(result.error)
    }

    await autoConfirmRecentDays(7)

    const dailyResult = await prisma.dailyResult.findUnique({
      where: { dayKey: result.data.dayKey },
      select: {
        dayKey: true,
        status: true,
        confirmedAt: true,
        categoryResults: {
          orderBy: [{ category: { order: 'asc' } }, { categoryId: 'asc' }],
          select: {
            id: true,
            dayKey: true,
            categoryId: true,
            playCount: true,
            xpEarned: true,
            spEarned: true,
            category: {
              select: {
                id: true,
                name: true,
                order: true,
                xpPerPlay: true,
                xpPerSp: true,
              },
            },
          },
        },
      },
    })

    if (!dailyResult) {
      return NextResponse.json({
        dailyResult: {
          dayKey: result.data.dayKey,
          status: DAILY_RESULT_STATUS.DRAFT,
          confirmedAt: null,
        },
        categoryResults: [],
      })
    }

    const { categoryResults, ...dailyResultData } = dailyResult

    return NextResponse.json({
      dailyResult: dailyResultData,
      categoryResults,
    })
  } catch (error) {
    console.error('Failed to fetch daily result:', error)
    return formatInternalError('日次リザルトの取得に失敗しました')
  }
}

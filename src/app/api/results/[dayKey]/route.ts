import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { DAILY_RESULT_STATUS } from '@/lib/constants'
import { dayKeyParamSchema } from '@/lib/validations/result'
import { formatInternalError, formatZodError } from '@/lib/validations/helpers'
import { confirmDay } from '@/lib/domains'
import { getTodayKey } from '@/lib/date'
import { requireUser, isUserFailure } from '@/lib/api/requireUser'

/**
 * GET /api/results/:dayKey
 * 日次リザルトを取得
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ dayKey?: string }> }
) {
  try {
    const userResult = await requireUser()
    if (isUserFailure(userResult)) {
      return userResult.response
    }

    const { dayKey } = await params
    const result = dayKeyParamSchema.safeParse({ dayKey: dayKey ?? '' })

    if (!result.success) {
      return formatZodError(result.error)
    }

    const validatedDayKey = result.data.dayKey
    const todayKey = getTodayKey()

    const disableAutoConfirm = process.env.DISABLE_AUTO_CONFIRM === 'true'

    // 過去日付の場合のみ遅延確定
    if (!disableAutoConfirm && validatedDayKey < todayKey) {
      try {
        await confirmDay(userResult.userId, validatedDayKey, {
          allowAlreadyConfirmed: true,
        })
      } catch (error) {
        console.error(`Failed to auto-confirm day ${validatedDayKey}:`, error)
      }
    }

    const dailyResult = await prisma.dailyResult.findUnique({
      where: {
        userId_dayKey: { userId: userResult.userId, dayKey: validatedDayKey },
      },
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
          dayKey: validatedDayKey,
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

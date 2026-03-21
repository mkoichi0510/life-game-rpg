import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { formatInternalError } from '@/lib/validations/helpers'
import { getTodayKey, getPreviousDayKey, getRecentDayKeys } from '@/lib/date'
import { requireUser, isUserFailure } from '@/lib/api/requireUser'
import { MAX_STREAK_DAYS } from '@/lib/constants'

/**
 * GET /api/streak
 * 連続記録日数（ストリーク）を取得
 *
 * 今日から遡って、プレイが記録されている連続日数を返す
 */
export async function GET() {
  try {
    const userResult = await requireUser()
    if (isUserFailure(userResult)) {
      return userResult.response
    }

    // プレイがある日付（dayKey）を降順で取得（最大MAX_STREAK_DAYS日以内に絞る）
    // IN句の代わりに範囲クエリを使いDBのインデックスを効率的に利用する
    const earliestDayKey = getRecentDayKeys(MAX_STREAK_DAYS).at(-1)!

    const daysWithPlays = await prisma.dailyCategoryResult.findMany({
      where: {
        userId: userResult.userId,
        playCount: { gt: 0 },
        dayKey: { gte: earliestDayKey },
      },
      select: { dayKey: true },
      distinct: ['dayKey'],
      orderBy: { dayKey: 'desc' },
    })

    const playedDayKeySet = new Set(daysWithPlays.map((d) => d.dayKey))
    const todayKey = getTodayKey()

    // 今日記録済みなら今日から、未記録なら昨日から遡る（grace period）
    const startDay = playedDayKeySet.has(todayKey)
      ? todayKey
      : getPreviousDayKey(todayKey)

    let streak = 0
    let currentDay = startDay

    while (playedDayKeySet.has(currentDay)) {
      streak++
      currentDay = getPreviousDayKey(currentDay)
    }

    const playedToday = playedDayKeySet.has(todayKey)
    return NextResponse.json({ streak, playedToday })
  } catch (error) {
    console.error('Failed to fetch streak:', error)
    return formatInternalError('ストリーク情報の取得に失敗しました')
  }
}

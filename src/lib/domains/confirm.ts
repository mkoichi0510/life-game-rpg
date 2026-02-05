import { prisma } from '@/lib/prisma'
import { DAILY_RESULT_STATUS } from '@/lib/constants'
import { calculateSpFromXp, calculateXpEarned } from '@/lib/calculation'
import { getRecentDayKeys, getTodayKey } from '@/lib/date'
import { AlreadyConfirmedError, FutureDateError } from './errors'

type ConfirmOptions = {
  allowAlreadyConfirmed?: boolean
}

export async function confirmDay(
  userId: string,
  dayKey: string,
  options?: ConfirmOptions
) {
  const todayKey = getTodayKey()
  if (dayKey > todayKey) {
    throw new FutureDateError(dayKey)
  }

  return prisma.$transaction(async (tx) => {
    let dailyResult = await tx.dailyResult.findUnique({
      where: { userId_dayKey: { userId, dayKey } },
      include: {
        categoryResults: {
          where: { userId },
          include: { category: true },
        },
      },
    })

    if (!dailyResult) {
      dailyResult = await tx.dailyResult.create({
        data: { userId, dayKey },
        include: {
          categoryResults: {
            where: { userId },
            include: { category: true },
          },
        },
      })
    }

    if (dailyResult.status === DAILY_RESULT_STATUS.CONFIRMED) {
      if (options?.allowAlreadyConfirmed) {
        return dailyResult
      }
      throw new AlreadyConfirmedError(dayKey)
    }

    for (const categoryResult of dailyResult.categoryResults) {
      const xpEarned = calculateXpEarned(
        categoryResult.playCount,
        categoryResult.category.xpPerPlay
      )
      const spEarned = calculateSpFromXp(
        xpEarned,
        categoryResult.category.xpPerSp
      )

      await tx.dailyCategoryResult.update({
        where: { id: categoryResult.id },
        data: { xpEarned, spEarned },
      })

      await tx.playerCategoryState.upsert({
        where: { categoryId: categoryResult.categoryId },
        create: {
          userId,
          categoryId: categoryResult.categoryId,
          xpTotal: xpEarned,
          spUnspent: spEarned,
        },
        update: {
          xpTotal: { increment: xpEarned },
          spUnspent: { increment: spEarned },
        },
      })
    }

    return tx.dailyResult.update({
      where: { userId_dayKey: { userId, dayKey } },
      data: {
        status: DAILY_RESULT_STATUS.CONFIRMED,
        confirmedAt: new Date(),
      },
    })
  })
}

export async function autoConfirmRecentDays(userId: string, days: number) {
  const todayKey = getTodayKey()
  const recentDayKeys = getRecentDayKeys(days).filter(
    (dayKey) => dayKey !== todayKey
  )

  await Promise.all(
    recentDayKeys.map((dayKey) =>
      confirmDay(userId, dayKey, { allowAlreadyConfirmed: true })
    )
  )
}

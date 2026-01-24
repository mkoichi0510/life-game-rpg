import { prisma } from '@/lib/prisma'
import { DAILY_RESULT_STATUS } from '@/lib/constants'
import { calculateSpFromXp, calculateXpEarned } from '@/lib/calculation'
import { getRecentDayKeys, getTodayKey } from '@/lib/date'

type ConfirmOptions = {
  allowAlreadyConfirmed?: boolean
}

const createAlreadyConfirmedError = () => {
  const error = new Error('Already confirmed')
  ;(error as Error & { code: string }).code = 'ALREADY_CONFIRMED'
  return error
}

export async function confirmDay(dayKey: string, options?: ConfirmOptions) {
  return prisma.$transaction(async (tx) => {
    let dailyResult = await tx.dailyResult.findUnique({
      where: { dayKey },
      include: { categoryResults: { include: { category: true } } },
    })

    if (!dailyResult) {
      dailyResult = await tx.dailyResult.create({
        data: { dayKey },
        include: { categoryResults: { include: { category: true } } },
      })
    }

    if (dailyResult.status === DAILY_RESULT_STATUS.CONFIRMED) {
      if (options?.allowAlreadyConfirmed) {
        return dailyResult
      }
      throw createAlreadyConfirmedError()
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
      where: { dayKey },
      data: {
        status: DAILY_RESULT_STATUS.CONFIRMED,
        confirmedAt: new Date(),
      },
    })
  })
}

export async function autoConfirmRecentDays(days: number) {
  const todayKey = getTodayKey()
  const recentDayKeys = getRecentDayKeys(days).filter(
    (dayKey) => dayKey !== todayKey
  )

  for (const dayKey of recentDayKeys) {
    await confirmDay(dayKey, { allowAlreadyConfirmed: true })
  }
}

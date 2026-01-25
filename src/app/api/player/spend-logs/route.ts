import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { categoryIdParamSchema } from '@/lib/validations/player'
import {
  formatInternalError,
  formatZodError,
} from '@/lib/validations/helpers'
import { requireCategory, isCategoryFailure } from '@/lib/api/requireCategory'

/**
 * GET /api/player/spend-logs
 * SP消費履歴を取得
 * クエリパラメータ:
 *   - categoryId: 対象カテゴリID（必須）
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = {
      categoryId: searchParams.get('categoryId') ?? '',
    }
    const result = categoryIdParamSchema.safeParse(query)

    if (!result.success) {
      return formatZodError(result.error)
    }

    const categoryResult = await requireCategory(result.data.categoryId)
    if (isCategoryFailure(categoryResult)) {
      return categoryResult.response
    }

    const spendLogs = await prisma.spendLog.findMany({
      where: { categoryId: result.data.categoryId },
      orderBy: [{ at: 'desc' }, { id: 'desc' }],
      select: {
        id: true,
        at: true,
        categoryId: true,
        type: true,
        costSp: true,
        refId: true,
        dayKey: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ spendLogs })
  } catch (error) {
    console.error('Failed to fetch spend logs:', error)
    return formatInternalError('SP消費履歴の取得に失敗しました')
  }
}

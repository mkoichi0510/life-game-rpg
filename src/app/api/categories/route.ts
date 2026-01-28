import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createCategorySchema } from '@/lib/validations/category'
import {
  formatInternalError,
  formatZodError,
} from '@/lib/validations/helpers'

/**
 * GET /api/categories
 * カテゴリ一覧を取得（id昇順）
 * クエリパラメータ:
 *   - visible=true: 表示中のカテゴリのみ取得
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const visibleOnly = searchParams.get('visible') === 'true'

    const categories = await prisma.category.findMany({
      where: visibleOnly ? { visible: true } : undefined,
      orderBy: { id: 'asc' },
    })

    return NextResponse.json({ categories })
  } catch (error) {
    console.error('Failed to fetch categories:', error)
    return formatInternalError('カテゴリの取得に失敗しました')
  }
}

/**
 * POST /api/categories
 * カテゴリを新規作成
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const result = createCategorySchema.safeParse(body)

    if (!result.success) {
      return formatZodError(result.error)
    }

    const category = await prisma.category.create({
      data: {
        name: result.data.name,
        visible: result.data.visible,
        order: result.data.order,
        rankWindowDays: result.data.rankWindowDays,
        xpPerPlay: result.data.xpPerPlay,
        xpPerSp: result.data.xpPerSp,
      },
    })

    return NextResponse.json({ category }, { status: 201 })
  } catch (error) {
    console.error('Failed to create category:', error)
    return formatInternalError('カテゴリの作成に失敗しました')
  }
}

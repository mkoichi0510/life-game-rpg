import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createActionSchema, getActionsQuerySchema } from '@/lib/validations/action'
import {
  formatZodError,
  formatNotFoundError,
  formatInternalError,
} from '@/lib/validations/helpers'

/**
 * GET /api/actions
 * アクション一覧を取得（order昇順）
 * クエリパラメータ:
 *   - categoryId: 対象カテゴリID（必須）
 *   - visible=true: 表示中のアクションのみ取得
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = {
      categoryId: searchParams.get('categoryId') ?? '',
      visible: searchParams.get('visible') ?? undefined,
    }
    const result = getActionsQuerySchema.safeParse(query)

    if (!result.success) {
      return formatZodError(result.error)
    }

    const category = await prisma.category.findUnique({
      where: { id: result.data.categoryId },
      select: { id: true },
    })

    if (!category) {
      return formatNotFoundError('カテゴリ', result.data.categoryId)
    }

    const actions = await prisma.action.findMany({
      where: {
        categoryId: result.data.categoryId,
        ...(result.data.visible ? { visible: true } : {}),
      },
      orderBy: [{ order: 'asc' }, { id: 'asc' }],
    })

    return NextResponse.json({ actions })
  } catch (error) {
    console.error('Failed to fetch actions:', error)
    return formatInternalError('アクションの取得に失敗しました')
  }
}

/**
 * POST /api/actions
 * アクションを新規作成
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const result = createActionSchema.safeParse(body)

    if (!result.success) {
      return formatZodError(result.error)
    }

    const category = await prisma.category.findUnique({
      where: { id: result.data.categoryId },
      select: { id: true },
    })

    if (!category) {
      return formatNotFoundError('カテゴリ', result.data.categoryId)
    }

    const action = await prisma.action.create({
      data: {
        categoryId: result.data.categoryId,
        label: result.data.label,
        visible: result.data.visible,
        order: result.data.order,
      },
    })

    return NextResponse.json({ action }, { status: 201 })
  } catch (error) {
    console.error('Failed to create action:', error)
    return formatInternalError('アクションの作成に失敗しました')
  }
}

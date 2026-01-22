import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/categories
 * カテゴリ一覧を取得（id昇順）
 */
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { id: 'asc' },
    })

    return NextResponse.json({ categories })
  } catch (error) {
    console.error('Failed to fetch categories:', error)
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'カテゴリの取得に失敗しました',
        },
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/categories
 * カテゴリを新規作成
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, visible, order, rankWindowDays, xpPerPlay, xpPerSp } = body

    // バリデーション: name は必須
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: '入力値が不正です',
            details: {
              field: 'name',
              reason: 'カテゴリ名は必須です',
            },
          },
        },
        { status: 400 }
      )
    }

    // バリデーション: name の長さ制限（最大50文字）
    if (name.length > 50) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: '入力値が不正です',
            details: {
              field: 'name',
              reason: 'カテゴリ名は最大50文字までです',
            },
          },
        },
        { status: 400 }
      )
    }

    // バリデーション: order は数値
    if (order !== undefined && (typeof order !== 'number' || !Number.isInteger(order))) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: '入力値が不正です',
            details: {
              field: 'order',
              reason: '表示順序は整数で指定してください',
            },
          },
        },
        { status: 400 }
      )
    }

    // バリデーション: rankWindowDays は正の整数
    if (rankWindowDays !== undefined && (typeof rankWindowDays !== 'number' || !Number.isInteger(rankWindowDays) || rankWindowDays < 1)) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: '入力値が不正です',
            details: {
              field: 'rankWindowDays',
              reason: 'ランク判定期間は1以上の整数で指定してください',
            },
          },
        },
        { status: 400 }
      )
    }

    // バリデーション: xpPerPlay は正の整数
    if (xpPerPlay !== undefined && (typeof xpPerPlay !== 'number' || !Number.isInteger(xpPerPlay) || xpPerPlay < 1)) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: '入力値が不正です',
            details: {
              field: 'xpPerPlay',
              reason: 'プレイ当たりXPは1以上の整数で指定してください',
            },
          },
        },
        { status: 400 }
      )
    }

    // バリデーション: xpPerSp は正の整数
    if (xpPerSp !== undefined && (typeof xpPerSp !== 'number' || !Number.isInteger(xpPerSp) || xpPerSp < 1)) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: '入力値が不正です',
            details: {
              field: 'xpPerSp',
              reason: 'SP変換に必要なXPは1以上の整数で指定してください',
            },
          },
        },
        { status: 400 }
      )
    }

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        visible: visible ?? true,
        order: order ?? 0,
        rankWindowDays: rankWindowDays ?? 7,
        xpPerPlay: xpPerPlay ?? 10,
        xpPerSp: xpPerSp ?? 20,
      },
    })

    return NextResponse.json({ category }, { status: 201 })
  } catch (error) {
    console.error('Failed to create category:', error)
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'カテゴリの作成に失敗しました',
        },
      },
      { status: 500 }
    )
  }
}
